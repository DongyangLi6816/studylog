import jwt from 'jsonwebtoken';
import { config } from '../config';

export function signAccess(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function signRefresh(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function verifyToken(token: string, secret: string): jwt.JwtPayload {
  const payload = jwt.verify(token, secret);
  if (typeof payload === 'string') throw new Error('Invalid token payload');
  return payload;
}
