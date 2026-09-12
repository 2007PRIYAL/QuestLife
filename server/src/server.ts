import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { pool } from './db/pool';

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');

    app.listen(PORT, () => {
      console.log(`Life RPG API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await pool.end();
    process.exit(1);
  }
};

startServer();