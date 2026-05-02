import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { verifyAccess } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import type { LeetcodeEntry } from '@prisma/client';

export const leetcodeRouter = Router();
leetcodeRouter.use(verifyAccess);

function toFrontend(e: LeetcodeEntry) {
  return {
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    problemName: e.problemName,
    problemNumber: e.problemNumber,
    difficulty: e.difficulty,
    status: e.status,
    topics: e.tags as string[],
    timeSpentMinutes: e.timeSpentMinutes,
    notes: e.notes,
    url: e.url,
    date: e.date,
  };
}

const EntryBody = z.object({
  problemName: z.string().min(1),
  problemNumber: z.number().int().positive().nullable().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  status: z.enum(['Solved', 'Attempted', 'Revisit']).default('Solved'),
  topics: z.array(z.string()).default([]),
  timeSpentMinutes: z.number().int().min(0).default(0),
  notes: z.string().default(''),
  url: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const EntryPatch = EntryBody.partial();

const ListQuery = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  status: z.enum(['Solved', 'Attempted', 'Revisit']).optional(),
  q: z.string().optional(),
});

leetcodeRouter.get('/', validateQuery(ListQuery), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty, status, q } = req.query as z.infer<typeof ListQuery>;
    const entries = await prisma.leetcodeEntry.findMany({
      where: {
        userId: req.userId,
        ...(difficulty && { difficulty }),
        ...(status && { status }),
        ...(q && {
          OR: [
            { problemName: { contains: q, mode: 'insensitive' } },
            ...(Number.isInteger(Number(q)) ? [{ problemNumber: Number(q) }] : []),
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries.map(toFrontend));
  } catch (err) { next(err); }
});

leetcodeRouter.post('/', validateBody(EntryBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topics, ...rest } = req.body as z.infer<typeof EntryBody>;
    const entry = await prisma.leetcodeEntry.create({
      data: { ...rest, tags: topics, userId: req.userId },
    });
    res.status(201).json(toFrontend(entry));
  } catch (err) { next(err); }
});

leetcodeRouter.patch('/:id', validateBody(EntryPatch), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.leetcodeEntry.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Entry not found');

    const { topics, ...rest } = req.body as z.infer<typeof EntryPatch>;
    const entry = await prisma.leetcodeEntry.update({
      where: { id: req.params.id },
      data: { ...rest, ...(topics !== undefined && { tags: topics }) },
    });
    res.json(toFrontend(entry));
  } catch (err) { next(err); }
});

leetcodeRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.leetcodeEntry.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Entry not found');

    await prisma.leetcodeEntry.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});
