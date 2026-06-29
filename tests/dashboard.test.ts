import { PrismaClient } from '@prisma/client';
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

describe.skipIf(!dbAvailable)('Dashboard API', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboard returns dashboard metrics', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.todaysEvents)).toBe(true);
    expect(Array.isArray(body.data.upcomingEvents)).toBe(true);
    expect(typeof body.data.pendingFollowups).toBe('number');
    expect(body.data.monthlyRevenue).toBeTypeOf('string');
    expect(body.data.todaysCollections).toBeTypeOf('string');
    expect(typeof body.data.newLeads).toBe('number');
    expect(typeof body.data.bookings).toBe('number');
    expect(typeof body.data.cancelledEvents).toBe('number');
  });

  it('GET /dashboard requires authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard',
    });

    expect(response.statusCode).toBe(401);
  });
});
