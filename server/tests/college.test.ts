import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerUser, authHeader } from './helpers';

describe('College CRUD', () => {
  it('creates a semester and returns nested structure', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(accessToken))
      .send({ name: 'Spring 2026' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Spring 2026');
    expect(res.body.courses).toEqual([]);
  });

  it('full tree GET returns semesters with courses and entries', async () => {
    const { accessToken } = await registerUser();
    const sem = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(accessToken))
      .send({ name: 'Fall 2025' });
    const semId = sem.body.id;

    await request(app)
      .post(`/api/college/semesters/${semId}/courses`)
      .set(await authHeader(accessToken))
      .send({ name: 'Data Structures', code: 'CS201' });

    const res = await request(app).get('/api/college').set(await authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.semesters).toHaveLength(1);
    expect(res.body.semesters[0].courses).toHaveLength(1);
    expect(res.body.semesters[0].courses[0].entries).toEqual([]);
  });

  it('creates a course entry with extra fields', async () => {
    const { accessToken } = await registerUser();
    const sem = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(accessToken))
      .send({ name: 'S' });
    const course = await request(app)
      .post(`/api/college/semesters/${sem.body.id}/courses`)
      .set(await authHeader(accessToken))
      .send({ name: 'Algorithms', code: 'CS301' });

    const res = await request(app)
      .post(`/api/college/courses/${course.body.id}/entries`)
      .set(await authHeader(accessToken))
      .send({
        name: 'Assignment 1',
        type: 'Assignment',
        grade: 'A',
        date: '2026-04-01',
        timeSpentMinutes: 90,
        notes: 'Hard but done',
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Assignment 1');
    expect(res.body.grade).toBe('A');
    expect(res.body.timeSpentMinutes).toBe(90);
  });

  it('prevents accessing other user college data', async () => {
    const { accessToken: t1 } = await registerUser('a@t.com');
    const { accessToken: t2 } = await registerUser('b@t.com');
    const sem = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(t1))
      .send({ name: 'Mine' });
    const res = await request(app)
      .delete(`/api/college/semesters/${sem.body.id}`)
      .set(await authHeader(t2));
    expect(res.status).toBe(404);
  });

  it('cascade deletes courses and entries when semester is deleted', async () => {
    const { accessToken } = await registerUser();
    const sem = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(accessToken))
      .send({ name: 'Delete me' });
    const course = await request(app)
      .post(`/api/college/semesters/${sem.body.id}/courses`)
      .set(await authHeader(accessToken))
      .send({ name: 'Course' });
    await request(app)
      .post(`/api/college/courses/${course.body.id}/entries`)
      .set(await authHeader(accessToken))
      .send({ name: 'E', type: 'Assignment', date: '2026-04-01', timeSpentMinutes: 10 });

    await request(app)
      .delete(`/api/college/semesters/${sem.body.id}`)
      .set(await authHeader(accessToken));

    const tree = await request(app).get('/api/college').set(await authHeader(accessToken));
    expect(tree.body.semesters).toHaveLength(0);
  });

  it('updates a semester name', async () => {
    const { accessToken } = await registerUser();
    const sem = await request(app)
      .post('/api/college/semesters')
      .set(await authHeader(accessToken))
      .send({ name: 'Old' });
    const res = await request(app)
      .patch(`/api/college/semesters/${sem.body.id}`)
      .set(await authHeader(accessToken))
      .send({ name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });
});
