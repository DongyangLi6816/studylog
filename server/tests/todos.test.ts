import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerUser, authHeader } from './helpers';

describe('Todos CRUD', () => {
  it('creates and retrieves a todo', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Buy milk', scheduledDate: '2026-05-01' });
    expect(create.status).toBe(201);
    expect(create.body.text).toBe('Buy milk');
    expect(create.body.scheduledDate).toBe('2026-05-01');

    const list = await request(app).get('/api/todos').set(await authHeader(accessToken));
    expect(list.body.todos).toHaveLength(1);
  });

  it('toggles completion via PATCH completed field', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Task', scheduledDate: '2026-05-01' });
    const id = create.body.id;
    const res = await request(app)
      .patch(`/api/todos/${id}`)
      .set(await authHeader(accessToken))
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.completedAt).toBeTruthy();
  });

  it('adds time via elapsedMs and merges timeSessions', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Study', scheduledDate: '2026-05-01' });
    const id = create.body.id;

    // First add
    const r1 = await request(app)
      .patch(`/api/todos/${id}`)
      .set(await authHeader(accessToken))
      .send({ elapsedMs: 60000 }); // 60s
    expect(r1.body.timeSpentSeconds).toBe(60);
    expect(r1.body.timeSessions).toHaveLength(1);
    expect(r1.body.timeSessions[0].seconds).toBe(60);

    // Second add same day — should merge
    const r2 = await request(app)
      .patch(`/api/todos/${id}`)
      .set(await authHeader(accessToken))
      .send({ elapsedMs: 30000 }); // 30s more
    expect(r2.body.timeSpentSeconds).toBe(90);
    expect(r2.body.timeSessions).toHaveLength(1); // same day, merged
    expect(r2.body.timeSessions[0].seconds).toBe(90);
  });

  it('moves a todo via scheduledDate patch', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Move me', scheduledDate: '2026-05-01' });
    const res = await request(app)
      .patch(`/api/todos/${create.body.id}`)
      .set(await authHeader(accessToken))
      .send({ scheduledDate: '2026-05-02' });
    expect(res.body.scheduledDate).toBe('2026-05-02');
  });

  it('marks as cross-logged', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'LC problem', scheduledDate: '2026-05-01' });
    const res = await request(app)
      .patch(`/api/todos/${create.body.id}`)
      .set(await authHeader(accessToken))
      .send({ crossLogged: true });
    expect(res.body.crossLogged).toBe(true);
  });

  it('deletes a todo', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Delete me', scheduledDate: '2026-05-01' });
    const del = await request(app)
      .delete(`/api/todos/${create.body.id}`)
      .set(await authHeader(accessToken));
    expect(del.status).toBe(204);
  });

  it('bulk moves tomorrow todos to today', async () => {
    const { accessToken } = await registerUser();
    await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'Tomorrow task', scheduledDate: '2026-05-03' });

    const res = await request(app)
      .patch('/api/todos')
      .set(await authHeader(accessToken))
      .send({
        filter: { scheduledDate: '2026-05-03', completed: false },
        patch: { scheduledDate: '2026-05-02' },
      });
    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(1);
  });

  it('rejects unknown keys via strict schema', async () => {
    const { accessToken } = await registerUser();
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(accessToken))
      .send({ text: 'T', scheduledDate: '2026-05-01' });
    const res = await request(app)
      .patch(`/api/todos/${create.body.id}`)
      .set(await authHeader(accessToken))
      .send({ unknownField: true });
    expect(res.status).toBe(400);
  });

  it('prevents accessing another user todo', async () => {
    const { accessToken: t1 } = await registerUser('a@t.com');
    const { accessToken: t2 } = await registerUser('b@t.com');
    const create = await request(app)
      .post('/api/todos')
      .set(await authHeader(t1))
      .send({ text: 'Mine', scheduledDate: '2026-05-01' });
    const res = await request(app)
      .patch(`/api/todos/${create.body.id}`)
      .set(await authHeader(t2))
      .send({ completed: true });
    expect(res.status).toBe(404);
  });
});
