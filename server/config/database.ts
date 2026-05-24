import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const isLocal = !process.env.DATABASE_URL || 
  process.env.DATABASE_URL.includes('localhost') || 
  process.env.DATABASE_URL.includes('127.0.0.1') ||
  process.env.DATABASE_URL.includes('host.docker.internal');

const sslConfig = isLocal ? undefined : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased to 30 seconds to handle cold-starts/latency
  keepAlive: true, // Enable TCP Keep-Alive to prevent connection drop issues
  keepAliveInitialDelayMillis: 10000, // Sent after 10 seconds of idle
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export default pool;
