import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { verifyAccess } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { getTodayString } from '../lib/stats';
import type { Todo } from '@prisma/client';

export const todosRouter = Router();
todosRouter.use(verifyAccess);

type TimeSession = { date: string; seconds: number };

function toFrontend(t: Todo) {
  return {
    id: t.id,
    text: t.title,
    category: t.category,
    completed: t.completed,
    completedAt: t.completedAt?.toISOString() ?? null,
    timeSpentSeconds: t.timeSpentSeconds,
    crossLogged: t.crossLogged,
    timeSessions: t.timeSessions as TimeSession[],
    scheduledDate: t.scheduledDate,
    createdAt: t.createdAt.toISOString(),
  };
}

const CreateBody = z.object({
  text: z.string().min(1),
  category: z.enum(['General', 'LeetCode', 'College']).default('General'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const PatchBody = z
  .object({
    text: z.string().min(1).optional(),
    category: z.string().optional(),
    completed: z.boolean().optional(),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    crossLogged: z.literal(true).optional(),
    elapsedMs: z.number().int().positive().optional(),
  })
  .strict();

const BulkPatchBody = z.object({
  filter: z.object({
    scheduledDate: z.string().optional(),
    scheduledDateBefore: z.string().optional(),
    completed: z.boolean().optional(),
  }),
  patch: z.object({
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

todosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ todos: todos.map(toFrontend) });
  } catch (err) { next(err); }
});

todosRouter.post('/', validateBody(CreateBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, category, scheduledDate } = req.body as z.infer<typeof CreateBody>;
    const todo = await prisma.todo.create({
      data: { title: text, category, scheduledDate, userId: req.userId },
    });
    res.status(201).json(toFrontend(todo));
  } catch (err) { next(err); }
});

todosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.todo.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Todo not found');
    await prisma.todo.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

todosRouter.patch('/:id', validateBody(PatchBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.todo.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Todo not found');

    const { text, completed, elapsedMs, crossLogged, scheduledDate, category } =
      req.body as z.infer<typeof PatchBody>;

    const data: Record<string, unknown> = {};

    if (text !== undefined) data.title = text;
    if (category !== undefined) data.category = category;
    if (scheduledDate !== undefined) data.scheduledDate = scheduledDate;
    if (crossLogged !== undefined) data.crossLogged = crossLogged;

    if (completed !== undefined) {
      data.completed = completed;
      data.completedAt = completed ? new Date() : null;
    }

    if (elapsedMs !== undefined) {
      const seconds = Math.floor(elapsedMs / 1000);
      if (seconds > 0) {
        const todayStr = getTodayString();
        const sessions = (existing.timeSessions as TimeSession[]) || [];
        const idx = sessions.findIndex((s) => s.date === todayStr);
        const newSessions: TimeSession[] =
          idx >= 0
            ? sessions.map((s, i) => (i === idx ? { ...s, seconds: s.seconds + seconds } : s))
            : [...sessions, { date: todayStr, seconds }];
        data.timeSessions = newSessions;
        data.timeSpentSeconds = existing.timeSpentSeconds + seconds;
      }
    }

    const todo = await prisma.todo.update({ where: { id: req.params.id }, data });
    res.json(toFrontend(todo));
  } catch (err) { next(err); }
});

// Bulk update — collection-level PATCH
todosRouter.patch('/', validateBody(BulkPatchBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filter, patch } = req.body as z.infer<typeof BulkPatchBody>;

    const where: Record<string, unknown> = {
      userId: req.userId,
      ...(filter.completed !== undefined && { completed: filter.completed }),
      ...(filter.scheduledDate !== undefined && { scheduledDate: filter.scheduledDate }),
      ...(filter.scheduledDateBefore !== undefined && {
        scheduledDate: { lt: filter.scheduledDateBefore },
      }),
    };

    const result = await prisma.todo.updateMany({ where, data: patch });
    res.json({ updated: result.count });
  } catch (err) { next(err); }
});
