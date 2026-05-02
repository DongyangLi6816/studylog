import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/db';
import { app, registerUser, authHeader } from './helpers';

const FIXTURE = {
  studylog_leetcode: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      problemName: 'Two Sum',
      problemNumber: 1,
      difficulty: 'Easy',
      status: 'Solved',
      topics: ['Array'],
      timeSpentMinutes: 15,
      notes: '',
      url: '',
      date: '2026-04-01',
      createdAt: '2026-04-01T10:00:00.000Z',
    },
  ],
  studylog_college: {
    semesters: [
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Spring 2026',
        courses: [
          {
            id: '33333333-3333-3333-3333-333333333333',
            code: 'CS101',
            name: 'Intro to CS',
            entries: [
              {
                id: '44444444-4444-4444-4444-444444444444',
                name: 'Assignment 1',
                type: 'Assignment',
                grade: 'A',
                date: '2026-04-05',
                timeSpentMinutes: 60,
                notes: '',
              },
            ],
          },
        ],
      },
    ],
  },
  studylog_todos: {
    todos: [
      {
        id: '55555555-5555-5555-5555-555555555555',
        text: 'Finish project',
        category: 'General',
        completed: false,
        timeSpentSeconds: 0,
        crossLogged: false,
        timeSessions: [],
        scheduledDate: '2026-05-01',
        createdAt: '2026-05-01T08:00:00.000Z',
      },
    ],
  },
};

describe('POST /api/import', () => {
  it('imports all data and returns counts', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app)
      .post('/api/import')
      .set(await authHeader(accessToken))
      .send(FIXTURE);
    expect(res.status).toBe(200);
    expect(res.body.leetcode).toBe(1);
    expect(res.body.courseEntries).toBe(1);
    expect(res.body.todos).toBe(1);
  });

  it('preserves original UUIDs', async () => {
    const { accessToken } = await registerUser();
    await request(app)
      .post('/api/import')
      .set(await authHeader(accessToken))
      .send(FIXTURE);

    const lc = await prisma.leetcodeEntry.findUnique({
      where: { id: '11111111-1111-1111-1111-111111111111' },
    });
    expect(lc).not.toBeNull();
    expect(lc?.problemName).toBe('Two Sum');
  });

  it('maps topics to tags on storage', async () => {
    const { accessToken } = await registerUser();
    await request(app)
      .post('/api/import')
      .set(await authHeader(accessToken))
      .send(FIXTURE);
    const lc = await prisma.leetcodeEntry.findFirst();
    expect(lc?.tags).toEqual(['Array']);
  });

  it('overwrites existing data on re-import', async () => {
    const { accessToken } = await registerUser();
    // First import
    await request(app).post('/api/import').set(await authHeader(accessToken)).send(FIXTURE);
    // Second import with different data
    const res = await request(app)
      .post('/api/import')
      .set(await authHeader(accessToken))
      .send({
        studylog_leetcode: [{ problemName: 'New Problem', difficulty: 'Hard', status: 'Attempted', topics: [], date: '2026-05-01', timeSpentMinutes: 0, notes: '', url: '' }],
      });
    expect(res.status).toBe(200);
    const allLc = await prisma.leetcodeEntry.findMany();
    expect(allLc).toHaveLength(1);
    expect(allLc[0].problemName).toBe('New Problem');
  });

  it('does not affect other users data', async () => {
    const { accessToken: t1 } = await registerUser('u1@t.com');
    const { accessToken: t2 } = await registerUser('u2@t.com');
    await request(app).post('/api/import').set(await authHeader(t1)).send(FIXTURE);
    // t2 imports empty
    await request(app)
      .post('/api/import')
      .set(await authHeader(t2))
      .send({ studylog_leetcode: [] });
    // t1 data should still be there
    const lc = await prisma.leetcodeEntry.findMany({ where: { user: { email: 'u1@t.com' } } });
    expect(lc).toHaveLength(1);
  });
});
