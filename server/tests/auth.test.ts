import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerUser, authHeader } from './helpers';

describe('POST /api/auth/register', () => {
  it('creates user and returns accessToken + sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.com', password: 'Password1' });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe('a@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email with 409', async () => {
    await registerUser('dup@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'Password1' });
    expect(res.status).toBe(409);
  });

  it('rejects password without digit', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'b@test.com', password: 'onlyletters' });
    expect(res.status).toBe(400);
  });

  it('rejects password without letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'c@test.com', password: '12345678' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'd@test.com', password: 'Ab1' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    await registerUser('login@test.com');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('rejects wrong password with 401', async () => {
    await registerUser('wrongpw@test.com');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpw@test.com', password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password1' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user for valid token', async () => {
    const { accessToken } = await registerUser('me@test.com');
    const res = await request(app)
      .get('/api/auth/me')
      .set(await authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with garbage token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('issues a new accessToken using refresh cookie', async () => {
    const { res: regRes } = await registerUser('refresh@test.com');
    const cookie = regRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('returns 401 without cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the cookie and returns 204', async () => {
    const { res: regRes } = await registerUser('logout@test.com');
    const cookie = regRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(res.status).toBe(204);
  });
});

describe('PATCH /api/auth/me', () => {
  it('updates displayName', async () => {
    const { accessToken } = await registerUser('patch@test.com');
    const res = await request(app)
      .patch('/api/auth/me')
      .set(await authHeader(accessToken))
      .send({ displayName: 'Alice' });
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe('Alice');
  });
});
