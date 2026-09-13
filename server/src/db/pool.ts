import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

const isProduction =
  process.env.NODE_ENV === 'production' ||
  databaseUrl.includes('sslmode=require') ||
  databaseUrl.includes('render.com') ||
  databaseUrl.includes('neon.tech') ||
  databaseUrl.includes('supabase.co') ||
  (!databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1'));

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
