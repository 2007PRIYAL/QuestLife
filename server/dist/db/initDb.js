"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseAndSchema = ensureDatabaseAndSchema;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
async function ensureDatabaseAndSchema() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is not configured in .env');
    }
    // Parse target DB name from DATABASE_URL
    const match = dbUrl.match(/\/([^/?]+)(\?|$)/);
    const targetDb = match ? match[1] : 'life_rpg';
    // 1. Try to connect to postgres admin database to check/create target database
    try {
        const adminUrl = dbUrl.replace(`/${targetDb}`, '/postgres');
        const adminClient = new pg_1.Client({ connectionString: adminUrl });
        await adminClient.connect();
        try {
            const checkDb = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
            if (checkDb.rows.length === 0) {
                console.log(`[Database] Database "${targetDb}" not found. Creating database...`);
                await adminClient.query(`CREATE DATABASE "${targetDb}"`);
                console.log(`[Database] Database "${targetDb}" created successfully.`);
            }
        }
        finally {
            await adminClient.end();
        }
    }
    catch (err) {
        // If adminClient can't connect, targetDb might already exist directly
        console.log(`[Database] Admin check note: ${err.message || err}`);
    }
    // 2. Connect to the target DB and verify/create schema
    const targetPool = new pg_1.Pool({ connectionString: dbUrl });
    try {
        await targetPool.query('SELECT 1');
        const tableCheck = await targetPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
        if (tableCheck.rows.length === 0) {
            console.log('[Database] Schema not found. Applying migrations/001_initial_schema.sql...');
            const schemaPath = path_1.default.resolve(__dirname, '../../migrations/001_initial_schema.sql');
            if (fs_1.default.existsSync(schemaPath)) {
                const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
                await targetPool.query(sql);
                console.log('[Database] Schema applied successfully.');
            }
            else {
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
    }
    finally {
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
