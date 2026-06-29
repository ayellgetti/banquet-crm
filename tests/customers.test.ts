import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const ADMIN_USERNAME = '9999999999';
const ADMIN_PASSWORD = 'Admin@123';
const TEST_MOBILE = '9123456789';

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

describe.skipIf(!dbAvailable)('Customers API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let createdCustomerId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: TEST_MOBILE } });
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: TEST_MOBILE } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /customers creates a customer', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: 'Phase',
        lastName: 'Four',
        mobileNo: TEST_MOBILE,
        emailId: 'phase4@example.com',
        city: 'Mumbai',
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.mobileNo).toBe(TEST_MOBILE);

    createdCustomerId = body.data.id;
  });

  it('POST /customers rejects duplicate mobile', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        firstName: 'Duplicate',
        lastName: 'Customer',
        mobileNo: TEST_MOBILE,
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it('GET /customers supports search and mobile filter', async () => {
    const searchResponse = await app.inject({
      method: 'GET',
      url: '/customers?search=Phase&page=1&limit=10',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(searchResponse.statusCode).toBe(200);
    expect(searchResponse.json().data.items.length).toBeGreaterThan(0);

    const mobileResponse = await app.inject({
      method: 'GET',
      url: `/customers?mobile=${TEST_MOBILE}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(mobileResponse.statusCode).toBe(200);
    expect(mobileResponse.json().data.items[0].mobileNo).toBe(TEST_MOBILE);
  });

  it('GET /customers/:id returns customer detail', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/customers/${createdCustomerId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(createdCustomerId);
  });

  it('PATCH /customers/:id updates a customer', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/customers/${createdCustomerId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        city: 'Pune',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.city).toBe('Pune');
  });

  it('GET /customers requires authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/customers',
    });

    expect(response.statusCode).toBe(401);
  });

  it('DELETE /customers/:id deletes a customer', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/customers/${createdCustomerId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('Customer deleted');
  });
});
