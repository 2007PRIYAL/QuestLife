import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { apiRateLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import questRoutes from './routes/quest.routes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json({ limit: '100kb' }));

app.use(apiRateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'life-rpg-api',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quests', questRoutes);

app.use(errorHandler);

export default app;