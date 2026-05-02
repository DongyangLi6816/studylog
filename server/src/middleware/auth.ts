import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/tokens';
import { config } from '../config';

export function verifyAccess(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing access token' } });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token, config.JWT_ACCESS_SECRET);
    req.userId = payload.sub as string;
    next();
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
