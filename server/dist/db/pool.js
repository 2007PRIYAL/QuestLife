"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
}
const isProduction = process.env.NODE_ENV === 'production' ||
    databaseUrl.includes('sslmode=require') ||
    databaseUrl.includes('render.com') ||
    databaseUrl.includes('neon.tech') ||
    databaseUrl.includes('supabase.co') ||
    (!databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1'));
exports.pool = new pg_1.Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
exports.pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error);
});
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
