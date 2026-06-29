import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const ADMIN_USERNAME = '9999999999';
const ADMIN_PASSWORD = 'Admin@123';

let dbAvailable = false;
let categoryId: string;

beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const admin = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });
    const category = await prisma.vendorCategory.findFirst();
    dbAvailable = admin !== null && category !== null;
    categoryId = category?.id.toString() ?? '';
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

describe.skipIf(!dbAvailable)('Vendors API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let vendorId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.vendor.deleteMany({ where: { vendorName: 'Phase Ten Decorators' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /vendors creates a vendor', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/vendors',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        categoryId,
        vendorName: 'Phase Ten Decorators',
        mobile: '9666677778',
        email: 'decor@example.com',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.category?.id).toBe(categoryId);

    vendorId = response.json().data.id;
  });

  it('GET /vendors lists vendors', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/vendors?search=Phase',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('PATCH /vendors/:id updates a vendor', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/vendors/${vendorId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        notes: 'Preferred vendor',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.notes).toBe('Preferred vendor');
  });

  it('DELETE /vendors/:id deletes a vendor', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/vendors/${vendorId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
  });
});

describe.skipIf(!dbAvailable)('Inventory API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let inventoryId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.inventory.deleteMany({ where: { title: 'Gold Chairs Set' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /inventory creates an item', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/inventory',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        title: 'Gold Chairs Set',
        category: 'Furniture',
        quantity: 100,
        unit: 'pcs',
        purchasePrice: 250000,
        inventoryType: 'OWNED',
        status: 'AVAILABLE',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.title).toBe('Gold Chairs Set');

    inventoryId = response.json().data.id;
  });

  it('GET /inventory lists items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/inventory?search=Gold',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('PATCH /inventory/:id updates an item', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/inventory/${inventoryId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        status: 'BOOKED',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe('BOOKED');
  });

  it('DELETE /inventory/:id deletes an item', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/inventory/${inventoryId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
  });
});
