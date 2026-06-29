import { PrismaClient, UserRole } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const ADMIN_USERNAME = '9999999999';
const ADMIN_PASSWORD = 'Admin@123';

let dbAvailable = false;

beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const admin = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });
    dbAvailable = admin !== null;
  } catch {
    dbAvailable = false;
  } finally {
    await prisma.$disconnect();
  }
});

async function loginAsAdmin(app: FastifyInstance) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    },
  });

  return response.json().data.accessToken as string;
}

describe.skipIf(!dbAvailable)('Users API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    if (createdUserId) {
      const prisma = new PrismaClient();
      await prisma.user.deleteMany({ where: { username: '9888877776' } });
      await prisma.$disconnect();
    }

    await app.close();
  });

  it('POST /users creates a user (admin only)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: 'Test',
        lastName: 'Sales',
        dob: '1995-06-15',
        mobileNo: '9888877776',
        role: UserRole.SALES,
        password: 'TestPass@1',
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.username).toBe('9888877776');
    expect(body.data.role).toBe('SALES');

    createdUserId = body.data.id;
  });

  it('POST /users rejects duplicate mobile', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: 'Duplicate',
        lastName: 'User',
        dob: '1995-06-15',
        mobileNo: '9888877776',
        role: UserRole.SALES,
        password: 'TestPass@1',
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it('GET /users lists users with pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users?page=1&limit=10&search=Test',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.data.items.length).toBeGreaterThan(0);
    expect(body.data.meta.page).toBe(1);
  });

  it('GET /users/:id returns user detail', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/users/${createdUserId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(createdUserId);
  });

  it('PATCH /users/:id updates a user', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${createdUserId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: 'Updated',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.firstName).toBe('Updated');
  });

  it('POST /users returns 403 for non-admin', async () => {
    const prisma = new PrismaClient();
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash('SalesPass@1', 12);

    await prisma.user.upsert({
      where: { username: '9777766665' },
      update: {},
      create: {
        username: '9777766665',
        firstName: 'Sales',
        lastName: 'User',
        dob: new Date('1992-01-01'),
        mobileNo: '9777766665',
        role: UserRole.SALES,
        passwordHash,
      },
    });
    await prisma.$disconnect();

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: '9777766665',
        password: 'SalesPass@1',
      },
    });

    const salesToken = loginResponse.json().data.accessToken;

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      headers: { authorization: `Bearer ${salesToken}` },
      payload: {
        firstName: 'Blocked',
        lastName: 'User',
        dob: '1995-01-01',
        mobileNo: '9666655554',
        role: UserRole.SALES,
        password: 'TestPass@1',
      },
    });

    expect(response.statusCode).toBe(403);

    const cleanup = new PrismaClient();
    await cleanup.user.deleteMany({ where: { username: '9777766665' } });
    await cleanup.$disconnect();
  });

  it('DELETE /users/:id deletes a user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${createdUserId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('User deleted');

    createdUserId = '';
  });
});
