import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error(err, 'Unhandled error');

  const message = config.NODE_ENV === 'production' ? 'Internal server error' : String(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
}
