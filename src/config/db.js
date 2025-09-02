// src/db/connectDB.js (or your existing path)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const raw = process.env.MONGO_URI;
  if (!raw) {
    console.error('❌ MONGO_URI is missing');
    process.exit(1);
  }
  const uri = raw.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');

  try {
    const u = new URL(uri);
    console.log(`🔌 Connecting to Mongo host: ${u.hostname}`);
  } catch {
    console.warn('⚠️ Could not parse MONGO_URI with URL(); ensure it is a valid mongodb+srv URI.');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // fail fast with clearer error
      family: 4,                       // force IPv4 to avoid SRV AAAA issues
    });

    // 3) Verify with a ping
    await mongoose.connection.db.admin().command({ ping: 1 });
    const { host, name: dbName } = mongoose.connection;
    console.log(`✅ MongoDB connected & ping OK (host=${host}, db=${dbName})`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error?.name, error?.message);
    if (error?.reason) console.error('   reason:', error.reason);

    console.error(
      [
        'Hints:',
        '- If it fails even with 0.0.0.0/0 in Atlas, it is NOT an IP issue.',
        '- Make sure your MONGO_URI has mongodb+srv:// and the correct cluster hostname.',
        '- If your password has @/:#?%& or spaces, it MUST be percent-encoded in the URI.',
        "- In Render, don't wrap the env value in quotes.",
        '- Ensure the DB user exists in Atlas → Database Access (not your Atlas login).',
        '- Make sure the cluster is running (not paused) and in the SAME Atlas project as your IP list.',
      ].join('\n')
    );
    process.exit(1);
  }
};

export default connectDB;