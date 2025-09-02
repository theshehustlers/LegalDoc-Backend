import 'dotenv/config';
import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';

const raw = process.env.MONGO_URI || '';
const uri = raw.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
if (!uri) {
  console.error('No MONGO_URI found in env (.env)');
  process.exit(1);
}
const base = new URL(uri).hostname;

function tcpTest(host) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port: 27017, timeout: 6000 }, () => {
      s.end();
      resolve({ host, tcp: true });
    });
    s.on('error', (e) => resolve({ host, tcp: false, err: e.code || e.message }));
    s.on('timeout', () => { s.destroy(); resolve({ host, tcp: false, err: 'TIMEOUT' }); });
  });
}

function tlsTest(host) {
  return new Promise((resolve) => {
    const s = tls.connect(27017, host, {
      servername: host,            // SNI
      rejectUnauthorized: true,    // verify Atlas cert
      timeout: 8000,
    }, () => {
      const cert = s.getPeerCertificate();
      s.end();
      resolve({
        host, tls: true,
        cn: cert?.subject?.CN,
        issuer: cert?.issuer?.O,
      });
    });
    s.on('error', (e) => resolve({ host, tls: false, err: e.code || e.message }));
    s.setTimeout(8000, () => { s.destroy(); resolve({ host, tls: false, err: 'TLS_TIMEOUT' }); });
  });
}

(async () => {
  try {
    const srv = await dns.resolveSrv(`_mongodb._tcp.${base}`);
    const targets = srv.map(s => s.name);
    console.log('SRV targets:', targets);
    for (const h of targets) {
      console.log(await tcpTest(h));
      console.log(await tlsTest(h));
    }
  } catch (e) {
    console.error('Probe error:', e?.name, e?.message);
  }
})();