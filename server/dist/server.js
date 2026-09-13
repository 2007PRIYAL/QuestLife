"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const pool_1 = require("./db/pool");
const initDb_1 = require("./db/initDb");
const PORT = Number(process.env.PORT) || 4000;
const startServer = async () => {
    try {
        console.log('Initializing database connection & schema...');
        await (0, initDb_1.ensureDatabaseAndSchema)();
        await pool_1.pool.query('SELECT 1');
        console.log('Database connected successfully.');
        app_1.default.listen(PORT, '0.0.0.0', () => {
            console.log(`Life RPG API running on port ${PORT} (http://localhost:${PORT})`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('\n=============================================');
        console.error(' [ERROR] FAILED TO START QUESTLIFE SERVER');
        console.error('=============================================');
        console.error('Details:', error?.message || error);
        console.error('\nTroubleshooting:');
        console.error('1. Is PostgreSQL running on your Mac?');
        console.error('   To start PostgreSQL 16:');
        console.error('   sudo /Library/PostgreSQL/16/bin/pg_ctl -D /Library/PostgreSQL/16/data start');
        console.error('2. Is the DATABASE_URL in server/.env correct?');
        console.error(`   DATABASE_URL=${process.env.DATABASE_URL}`);
        console.error('=============================================\n');
        await pool_1.pool.end();
        process.exit(1);
    }
};
startServer();
