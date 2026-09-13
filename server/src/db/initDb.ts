import { Client, Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export async function ensureDatabaseAndSchema(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured in .env');
  }

  // Parse target DB name from DATABASE_URL
  const match = dbUrl.match(/\/([^/?]+)(\?|$)/);
  const targetDb = match ? match[1] : 'life_rpg';

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    dbUrl.includes('sslmode=require') ||
    dbUrl.includes('render.com') ||
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co') ||
    (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));
  const sslConfig = isProduction ? { rejectUnauthorized: false } : undefined;

  // 1. Try to connect to postgres admin database to check/create target database
  try {
    const adminUrl = dbUrl.replace(`/${targetDb}`, '/postgres');
    const adminClient = new Client({ connectionString: adminUrl, ssl: sslConfig });
    await adminClient.connect();

    try {
      const checkDb = await adminClient.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [targetDb],
      );

      if (checkDb.rows.length === 0) {
        console.log(`[Database] Database "${targetDb}" not found. Creating database...`);
        await adminClient.query(`CREATE DATABASE "${targetDb}"`);
        console.log(`[Database] Database "${targetDb}" created successfully.`);
      }
    } finally {
      await adminClient.end();
    }
  } catch (err: any) {
    // If adminClient can't connect, targetDb might already exist directly
    console.log(`[Database] Admin check note: ${err.message || err}`);
  }

  // 2. Connect to the target DB and verify/create schema
  const targetPool = new Pool({ connectionString: dbUrl, ssl: sslConfig });
  try {
    await targetPool.query('SELECT 1');

    const tableCheck = await targetPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('[Database] Schema not found. Applying migrations/001_initial_schema.sql...');
      const schemaPath = path.resolve(__dirname, '../../migrations/001_initial_schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await targetPool.query(sql);
        console.log('[Database] Schema applied successfully.');
      } else {
        console.warn(`[Database] Migration file not found at ${schemaPath}`);
      }
    }

    // Ensure username column exists on users table
    await targetPool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'username'
        ) THEN
          ALTER TABLE users ADD COLUMN username VARCHAR(30) UNIQUE;
        END IF;
      END $$;
    `);
  } finally {
    await targetPool.end();
  }
}

// Allow running directly: npx tsx src/db/initDb.ts
if (process.argv[1]?.includes('initDb')) {
  ensureDatabaseAndSchema()
    .then(() => {
      console.log('[Database] Initialization completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Database] Initialization failed:', err);
      process.exit(1);
    });
}
