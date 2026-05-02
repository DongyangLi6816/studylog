import { execSync } from 'child_process';
import { prisma } from '../src/db';

// Set test env before config loads
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.ALLOWED_ORIGIN = 'http://localhost:5173';
process.env.BCRYPT_ROUNDS = '1'; // fast hashing in tests
process.env.LOG_LEVEL = 'silent';

beforeAll(async () => {
  // Reset test DB
  execSync('npx prisma migrate deploy', { env: process.env, stdio: 'inherit' });
});

beforeEach(async () => {
  // Clean all tables between tests (order matters due to FKs)
  await prisma.courseEntry.deleteMany();
  await prisma.course.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.leetcodeEntry.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
