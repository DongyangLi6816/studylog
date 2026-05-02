import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './logger';
import { authRouter } from './routes/auth';
import { leetcodeRouter } from './routes/leetcode';
import { collegeRouter } from './routes/college';
import { todosRouter } from './routes/todos';
import { statsRouter } from './routes/stats';
import { importRouter } from './routes/import';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.ALLOWED_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());

  if (config.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/leetcode', leetcodeRouter);
  app.use('/api/college', collegeRouter);
  app.use('/api/todos', todosRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/import', importRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
