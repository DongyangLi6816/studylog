import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { verifyAccess } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

export const importRouter = Router();
importRouter.use(verifyAccess);

const LcEntryImport = z.object({
  id: z.string().uuid().optional(),
  problemName: z.string().default(''),
  problemNumber: z.number().nullable().optional(),
  difficulty: z.string().default('Medium'),
  status: z.string().default('Solved'),
  topics: z.array(z.string()).default([]),
  timeSpentMinutes: z.number().default(0),
  notes: z.string().default(''),
  url: z.string().default(''),
  date: z.string().default(''),
  createdAt: z.string().optional(),
});

const CourseEntryImport = z.object({
  id: z.string().uuid().optional(),
  name: z.string().default(''),
  type: z.string().default('Assignment'),
  grade: z.string().default(''),
  date: z.string().default(''),
  timeSpentMinutes: z.number().default(0),
  notes: z.string().default(''),
  createdAt: z.string().optional(),
});

const CourseImport = z.object({
  id: z.string().uuid().optional(),
  code: z.string().default(''),
  name: z.string().default(''),
  creditHours: z.number().nullable().optional(),
  entries: z.array(CourseEntryImport).default([]),
  createdAt: z.string().optional(),
});

const SemesterImport = z.object({
  id: z.string().uuid().optional(),
  name: z.string().default(''),
  courses: z.array(CourseImport).default([]),
  createdAt: z.string().optional(),
});

const TodoImport = z.object({
  id: z.string().uuid().optional(),
  text: z.string().default(''),
  category: z.string().default('General'),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  timeSpentSeconds: z.number().default(0),
  crossLogged: z.boolean().default(false),
  timeSessions: z.array(z.object({ date: z.string(), seconds: z.number() })).default([]),
  scheduledDate: z.string().default(''),
  createdAt: z.string().optional(),
});

const ImportBody = z.object({
  studylog_leetcode: z.array(LcEntryImport).optional(),
  studylog_college: z
    .object({ semesters: z.array(SemesterImport) })
    .optional(),
  studylog_todos: z.object({ todos: z.array(TodoImport) }).optional(),
});

importRouter.post('/', validateBody(ImportBody), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as z.infer<typeof ImportBody>;
    const userId = req.userId;

    let leetcodeCount = 0;
    let courseEntryCount = 0;
    let todoCount = 0;

    await prisma.$transaction(async (tx) => {
      // Clear existing data
      await tx.leetcodeEntry.deleteMany({ where: { userId } });
      await tx.semester.deleteMany({ where: { userId } }); // cascades to courses/entries
      await tx.todo.deleteMany({ where: { userId } });

      // Import LeetCode entries
      if (body.studylog_leetcode?.length) {
        for (const e of body.studylog_leetcode) {
          await tx.leetcodeEntry.create({
            data: {
              ...(e.id && { id: e.id }),
              userId,
              problemName: e.problemName,
              problemNumber: e.problemNumber ?? null,
              difficulty: e.difficulty,
              status: e.status,
              tags: e.topics,
              timeSpentMinutes: e.timeSpentMinutes,
              notes: e.notes,
              url: e.url,
              date: e.date,
              ...(e.createdAt && { createdAt: new Date(e.createdAt) }),
            },
          });
          leetcodeCount++;
        }
      }

      // Import college data
      if (body.studylog_college?.semesters.length) {
        for (let si = 0; si < body.studylog_college.semesters.length; si++) {
          const sem = body.studylog_college.semesters[si];
          const createdSem = await tx.semester.create({
            data: {
              ...(sem.id && { id: sem.id }),
              userId,
              name: sem.name,
              position: si,
              ...(sem.createdAt && { createdAt: new Date(sem.createdAt) }),
            },
          });

          for (let ci = 0; ci < (sem.courses || []).length; ci++) {
            const course = sem.courses[ci];
            const createdCourse = await tx.course.create({
              data: {
                ...(course.id && { id: course.id }),
                semesterId: createdSem.id,
                code: course.code,
                name: course.name,
                creditHours: course.creditHours ?? null,
                position: ci,
                ...(course.createdAt && { createdAt: new Date(course.createdAt) }),
              },
            });

            for (const entry of course.entries || []) {
              await tx.courseEntry.create({
                data: {
                  ...(entry.id && { id: entry.id }),
                  courseId: createdCourse.id,
                  name: entry.name,
                  type: entry.type,
                  grade: entry.grade,
                  date: entry.date,
                  timeSpentMinutes: entry.timeSpentMinutes,
                  notes: entry.notes,
                  ...(entry.createdAt && { createdAt: new Date(entry.createdAt) }),
                },
              });
              courseEntryCount++;
            }
          }
        }
      }

      // Import todos
      if (body.studylog_todos?.todos.length) {
        for (const t of body.studylog_todos.todos) {
          await tx.todo.create({
            data: {
              ...(t.id && { id: t.id }),
              userId,
              title: t.text,
              category: t.category,
              completed: t.completed,
              completedAt: t.completedAt ? new Date(t.completedAt) : null,
              timeSpentSeconds: t.timeSpentSeconds,
              crossLogged: t.crossLogged,
              timeSessions: t.timeSessions,
              scheduledDate: t.scheduledDate,
              ...(t.createdAt && { createdAt: new Date(t.createdAt) }),
            },
          });
          todoCount++;
        }
      }
    });

    res.json({ leetcode: leetcodeCount, courseEntries: courseEntryCount, todos: todoCount });
  } catch (err) { next(err); }
});
