import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db';
import { hashPassword, comparePassword } from '../lib/password';
import { signAccess, signRefresh, verifyToken } from '../lib/tokens';
import { verifyAccess } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' } },
});

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: config.REFRESH_TOKEN_TTL_SECONDS * 1000,
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, cookieOptions);
}

const RegisterBody = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a digit'),
  displayName: z.string().max(100).optional(),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const MePatch = z.object({
  displayName: z.string().max(100).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

function safeUser(user: { id: string; email: string; displayName: string | null; theme: string }) {
  return { id: user.id, email: user.email, displayName: user.displayName, theme: user.theme };
}

authRouter.post('/register', authLimiter, validateBody(RegisterBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body as z.infer<typeof RegisterBody>;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'EMAIL_TAKEN', 'Email already registered');

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName: displayName ?? null },
    });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user: safeUser(user), accessToken });
  } catch (err) { next(err); }
});

authRouter.post('/login', authLimiter, validateBody(LoginBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginBody>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    setRefreshCookie(res, refreshToken);
    res.json({ user: safeUser(user), accessToken });
  } catch (err) { next(err); }
});

authRouter.post('/refresh', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw new AppError(401, 'UNAUTHORIZED', 'No refresh token');

    let payload;
    try {
      payload = verifyToken(token, config.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie('refreshToken');
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
    }

    const userId = payload.sub as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'User not found');

    const accessToken = signAccess(userId);
    const newRefreshToken = signRefresh(userId);
    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken, user: safeUser(user) });
  } catch (err) { next(err); }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.status(204).send();
});

authRouter.get('/me', verifyAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'User not found');
    res.json({ user: safeUser(user) });
  } catch (err) { next(err); }
});

authRouter.patch('/me', verifyAccess, validateBody(MePatch), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as z.infer<typeof MePatch>;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    res.json({ user: safeUser(user) });
  } catch (err) { next(err); }
});

// Stub — forgot password out of scope for v1
authRouter.post('/forgot-password', (_req, res) => {
  res.status(501).json({ error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});
