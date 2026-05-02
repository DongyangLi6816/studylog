import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { verifyAccess } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

export const collegeRouter = Router();
collegeRouter.use(verifyAccess);

// ── helpers ──────────────────────────────────────────────────────────────────

async function assertSemesterOwnership(semId: string, userId: string) {
  const sem = await prisma.semester.findFirst({ where: { id: semId, userId } });
  if (!sem) throw new AppError(404, 'NOT_FOUND', 'Semester not found');
  return sem;
}

async function assertCourseOwnership(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, semester: { userId } },
    include: { semester: true },
  });
  if (!course) throw new AppError(404, 'NOT_FOUND', 'Course not found');
  return course;
}

async function assertEntryOwnership(entryId: string, userId: string) {
  const entry = await prisma.courseEntry.findFirst({
    where: { id: entryId, course: { semester: { userId } } },
  });
  if (!entry) throw new AppError(404, 'NOT_FOUND', 'Entry not found');
  return entry;
}

// ── schemas ───────────────────────────────────────────────────────────────────

const SemesterBody = z.object({ name: z.string().min(1) });

const CourseBody = z.object({
  name: z.string().min(1),
  code: z.string().default(''),
  creditHours: z.number().int().positive().nullable().optional(),
});

const EntryBody = z.object({
  name: z.string().default(''),
  type: z.enum(['Assignment', 'Exam', 'Quiz', 'Lab', 'Project']).default('Assignment'),
  grade: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSpentMinutes: z.number().int().min(0).default(0),
  notes: z.string().default(''),
});

// ── full tree ─────────────────────────────────────────────────────────────────

collegeRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const semesters = await prisma.semester.findMany({
      where: { userId: req.userId },
      orderBy: { position: 'asc' },
      include: {
        courses: {
          orderBy: { position: 'asc' },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
    res.json({ semesters });
  } catch (err) { next(err); }
});

// ── semesters ─────────────────────────────────────────────────────────────────

collegeRouter.post('/semesters', validateBody(SemesterBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agg = await prisma.semester.aggregate({
      where: { userId: req.userId },
      _max: { position: true },
    });
    const position = (agg._max.position ?? -1) + 1;
    const sem = await prisma.semester.create({
      data: { name: req.body.name, userId: req.userId, position },
      include: { courses: { include: { entries: true } } },
    });
    res.status(201).json(sem);
  } catch (err) { next(err); }
});

collegeRouter.patch('/semesters/:semId', validateBody(SemesterBody.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertSemesterOwnership(req.params.semId, req.userId);
    const sem = await prisma.semester.update({
      where: { id: req.params.semId },
      data: req.body,
      include: { courses: { include: { entries: true } } },
    });
    res.json(sem);
  } catch (err) { next(err); }
});

collegeRouter.delete('/semesters/:semId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertSemesterOwnership(req.params.semId, req.userId);
    await prisma.semester.delete({ where: { id: req.params.semId } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ── courses ───────────────────────────────────────────────────────────────────

collegeRouter.post('/semesters/:semId/courses', validateBody(CourseBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertSemesterOwnership(req.params.semId, req.userId);
    const agg = await prisma.course.aggregate({
      where: { semesterId: req.params.semId },
      _max: { position: true },
    });
    const position = (agg._max.position ?? -1) + 1;
    const course = await prisma.course.create({
      data: { ...req.body, semesterId: req.params.semId, position },
      include: { entries: true },
    });
    res.status(201).json(course);
  } catch (err) { next(err); }
});

collegeRouter.patch('/courses/:courseId', validateBody(CourseBody.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertCourseOwnership(req.params.courseId, req.userId);
    const course = await prisma.course.update({
      where: { id: req.params.courseId },
      data: req.body,
      include: { entries: true },
    });
    res.json(course);
  } catch (err) { next(err); }
});

collegeRouter.delete('/courses/:courseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertCourseOwnership(req.params.courseId, req.userId);
    await prisma.course.delete({ where: { id: req.params.courseId } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ── entries ───────────────────────────────────────────────────────────────────

collegeRouter.post('/courses/:courseId/entries', validateBody(EntryBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertCourseOwnership(req.params.courseId, req.userId);
    const entry = await prisma.courseEntry.create({
      data: { ...req.body, courseId: req.params.courseId },
    });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

collegeRouter.patch('/entries/:entryId', validateBody(EntryBody.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertEntryOwnership(req.params.entryId, req.userId);
    const entry = await prisma.courseEntry.update({
      where: { id: req.params.entryId },
      data: req.body,
    });
    res.json(entry);
  } catch (err) { next(err); }
});

collegeRouter.delete('/entries/:entryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertEntryOwnership(req.params.entryId, req.userId);
    await prisma.courseEntry.delete({ where: { id: req.params.entryId } });
    res.status(204).send();
  } catch (err) { next(err); }
});
