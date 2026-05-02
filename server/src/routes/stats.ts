import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { verifyAccess } from '../middleware/auth';
import {
  buildDayMap,
  computeStreaks,
  minutesInRange,
  getTodayString,
  getWeekAgoString,
} from '../lib/stats';
import type { Todo } from '@prisma/client';

export const statsRouter = Router();
statsRouter.use(verifyAccess);

type TimeSession = { date: string; seconds: number };

async function loadDayMap(userId: string) {
  const [leetcodeEntries, semesters, todos] = await Promise.all([
    prisma.leetcodeEntry.findMany({
      where: { userId },
      select: { date: true, timeSpentMinutes: true },
    }),
    prisma.semester.findMany({
      where: { userId },
      select: {
        courses: {
          select: {
            entries: { select: { date: true, timeSpentMinutes: true } },
          },
        },
      },
    }),
    prisma.todo.findMany({
      where: { userId },
      select: { crossLogged: true, timeSessions: true },
    }),
  ]);

  const todoData = todos.map((t: Pick<Todo, 'crossLogged' | 'timeSessions'>) => ({
    crossLogged: t.crossLogged,
    timeSessions: (t.timeSessions as TimeSession[]) || [],
  }));

  return buildDayMap(leetcodeEntries, semesters, todoData);
}

statsRouter.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [dayMap, leetcodeSolved] = await Promise.all([
      loadDayMap(req.userId),
      prisma.leetcodeEntry.count({
        where: { userId: req.userId, status: 'Solved' },
      }),
    ]);

    const { currentStreak, longestStreak } = computeStreaks(dayMap);
    const today = getTodayString();
    const weekAgo = getWeekAgoString();
    const weeklyMinutes = minutesInRange(dayMap, weekAgo, today);
    const todayMinutes = dayMap[today]?.minutes ?? 0;

    res.json({ currentStreak, longestStreak, leetcodeSolved, weeklyMinutes, todayMinutes });
  } catch (err) { next(err); }
});

statsRouter.get('/heatmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dayMap = await loadDayMap(req.userId);
    res.json({ dayMap });
  } catch (err) { next(err); }
});
