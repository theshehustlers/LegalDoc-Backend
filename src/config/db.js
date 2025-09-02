// connectDB.js
import mongoose from 'mongoose';
import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import dotenv from 'dotenv';

dotenv.config();

// --- helpers (no secrets printed) ---
const clean = (s='') => s.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
const redact = (uri='') => {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '***';
    return u.toString();
  } catch { return uri; }
};

async function tcpTest(host, port=27017, timeout=6000) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port, timeout }, () => { s.end(); resolve({ host, tcp: true }); });
    s.on('error', (e) => resolve({ host, tcp: false, err: e.code || e.message }));
    s.on('timeout', () => { s.destroy(); resolve({ host, tcp: false, err: 'TIMEOUT' }); });
  });
}

async function tlsTest(host, port=27017, timeout=8000) {
  return new Promise((resolve) => {
    const s = tls.connect(port, host, { servername: host, rejectUnauthorized: true, timeout }, () => {
      const cert = s.getPeerCertificate();
      s.end();
      resolve({ host, tls: true, cn: cert?.subject?.CN, issuer: cert?.issuer?.O });
    });
    s.on('error', (e) => resolve({ host, tls: false, err: e.code || e.message }));
    s.setTimeout(timeout, () => { s.destroy(); resolve({ host, tls: false, err: 'TLS_TIMEOUT' }); });
  });
}

export default async function connectDB() {
  const rawUri = process.env.MONGO_URI || '';
  const uri = clean(rawUri);

  if (!uri) {
    console.error('❌ MONGO_URI is missing. Set it in your environment.');
    process.exit(1);
  }

  // Log target host/db (password redacted)
  try {
    const u = new URL(uri);
    console.log('🧭 Mongo target host:', u.hostname);
    console.log('🗄️  Mongo target db  :', (u.pathname || '/').slice(1) || '(default)');
  } catch { /* ignore parse errors */ }
  console.log('🔐 URI (redacted):', redact(uri));

  // --- Preflight (best effort; never blocks your app) ---
  try {
    const base = new URL(uri).hostname;
    if (uri.startsWith('mongodb+srv://')) {
      const srv = await dns.resolveSrv(`_mongodb._tcp.${base}`);
      const targets = srv.map(s => s.name);
      console.log('📡 SRV targets:', targets.join(', '));
      // Quick TCP/TLS check to first 2 targets (enough to spot issues)
      for (const h of targets.slice(0, 2)) {
        console.log('   ↳', await tcpTest(h));
        console.log('   ↳', await tlsTest(h));
      }
    } else {
      console.log('📡 Non-SRV URI; skipping SRV resolution.');
    }
  } catch (e) {
    console.warn('⚠️  Preflight failed (non-fatal):', e?.message);
  }

  // --- Optional: turn on Mongoose debug (comment out if noisy) ---
  // mongoose.set('debug', { color: true });

  // --- Connect ---
  try {
    const conn = await mongoose.connect(uri, {
      family: 4, // prefer IPv4 (cloud vendors sometimes need this)
      serverSelectionTimeoutMS: 12000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    // ping admin
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ Mongo connected & ping OK — host:', conn.connection.host);

    // Useful runtime events
    mongoose.connection.on('error', err => console.error('🛑 Mongoose error:', err?.message));
    mongoose.connection.on('disconnected', () => console.warn('⚠️  Mongoose disconnected'));
    mongoose.connection.on('reconnected', () => console.log('🔁 Mongoose reconnected'));
  } catch (err) {
    // Pretty print ServerSelectionError details
    console.error('❌ Error connecting to MongoDB:', err?.name, err?.message);
    if (err?.reason) {
      try {
        console.error('🧩 reason:', JSON.stringify(err.reason, null, 2));
      } catch {
        console.error('🧩 reason:', err.reason);
      }
    }
    // Final hints (quick)
    console.error(`Hints:
- If local works but Render fails: add Render outbound IPs to Atlas IP Access List.
- Ensure the Atlas DB user (not Atlas login) matches the URI and has the right roles.
- If antivirus/VPN inspects TLS, disable HTTPS scanning or whitelist *.mongodb.net:27017.
- In cloud envs, do NOT wrap MONGO_URI in quotes.`);

    process.exit(1);
  }
}