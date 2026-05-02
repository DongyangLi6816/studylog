import request from 'supertest';
import { createApp } from '../src/app';

export const app = createApp();

export async function registerUser(email = 'test@example.com', password = 'Password1') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password });
  return { accessToken: res.body.accessToken as string, user: res.body.user, res };
}

export async function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}
