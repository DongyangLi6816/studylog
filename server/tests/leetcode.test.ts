import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerUser, authHeader } from './helpers';

const ENTRY = {
  problemName: 'Two Sum',
  problemNumber: 1,
  difficulty: 'Easy',
  status: 'Solved',
  topics: ['Array', 'Hash Map'],
  timeSpentMinutes: 20,
  notes: 'Classic',
  url: 'https://leetcode.com/problems/two-sum/',
  date: '2026-05-01',
};

describe('LeetCode CRUD', () => {
  it('creates entry and returns it with topics field', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app)
      .post('/api/leetcode')
      .set(await authHeader(accessToken))
      .send(ENTRY);
    expect(res.status).toBe(201);
    expect(res.body.topics).toEqual(['Array', 'Hash Map']);
    expect(res.body.problemName).toBe('Two Sum');
  });

  it('lists entries for authenticated user', async () => {
    const { accessToken } = await registerUser();
    await request(app).post('/api/leetcode').set(await authHeader(accessToken)).send(ENTRY);
    const res = await request(app).get('/api/leetcode').set(await authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].topics).toBeDefined();
  });

  it('does not expose other user entries', async () => {
    const { accessToken: t1 } = await registerUser('u1@t.com');
    const { accessToken: t2 } = await registerUser('u2@t.com');
    await request(app).post('/api/leetcode').set(await authHeader(t1)).send(ENTRY);
    const res = await request(app).get('/api/leetcode').set(await authHeader(t2));
    expect(res.body).toHaveLength(0);
  });

  it('updates entry', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/leetcode')
      .set(await authHeader(accessToken))
      .send(ENTRY);
    const id = create.body.id;
    const res = await request(app)
      .patch(`/api/leetcode/${id}`)
      .set(await authHeader(accessToken))
      .send({ status: 'Revisit' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Revisit');
  });

  it('prevents patching another user entry', async () => {
    const { accessToken: t1 } = await registerUser('a@t.com');
    const { accessToken: t2 } = await registerUser('b@t.com');
    const create = await request(app)
      .post('/api/leetcode')
      .set(await authHeader(t1))
      .send(ENTRY);
    const res = await request(app)
      .patch(`/api/leetcode/${create.body.id}`)
      .set(await authHeader(t2))
      .send({ status: 'Revisit' });
    expect(res.status).toBe(404);
  });

  it('deletes entry', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/leetcode')
      .set(await authHeader(accessToken))
      .send(ENTRY);
    const del = await request(app)
      .delete(`/api/leetcode/${create.body.id}`)
      .set(await authHeader(accessToken));
    expect(del.status).toBe(204);
    const list = await request(app).get('/api/leetcode').set(await authHeader(accessToken));
    expect(list.body).toHaveLength(0);
  });

  it('filters by difficulty', async () => {
    const { accessToken } = await registerUser();
    await request(app).post('/api/leetcode').set(await authHeader(accessToken)).send(ENTRY);
    await request(app).post('/api/leetcode').set(await authHeader(accessToken))
      .send({ ...ENTRY, problemName: 'Hard One', difficulty: 'Hard' });
    const res = await request(app)
      .get('/api/leetcode?difficulty=Easy')
      .set(await authHeader(accessToken));
    expect(res.body).toHaveLength(1);
    expect(res.body[0].difficulty).toBe('Easy');
  });
});
