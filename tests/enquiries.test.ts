import { LeadStatus, PrismaClient } from '@prisma/client';
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

describe.skipIf(!dbAvailable)('Enquiries API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let customerId: string;
  let enquiryId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Enquiry',
        lastName: 'Test',
        mobileNo: '9111122223',
      },
    });
    customerId = customer.id.toString();
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: '9111122223' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /enquiries creates an enquiry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/enquiries',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        customerId,
        leadSource: 'Website',
        status: LeadStatus.NEW,
        remarks: 'Wedding enquiry',
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.data.status).toBe('NEW');
    expect(body.data.customer.id).toBe(customerId);

    enquiryId = body.data.id;
  });

  it('GET /enquiries lists enquiries with search', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/enquiries?search=Wedding&status=NEW',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('POST /enquiries/:id/convert creates event and marks enquiry converted', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/enquiries/${enquiryId}/convert`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        eventType: 'Wedding',
        eventDate: '2026-12-20',
        guestCount: 300,
        venue: 'Grand Hall',
        approxBudget: 500000,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.data.enquiry.status).toBe('CONVERTED');
    expect(body.data.event.enquiryId).toBe(enquiryId);
    expect(body.data.event.eventType).toBe('Wedding');
  });

  it('POST /enquiries/:id/convert rejects already converted enquiry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/enquiries/${enquiryId}/convert`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        eventType: 'Wedding',
        eventDate: '2026-12-21',
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it('PATCH /enquiries/:id rejects updates to converted enquiry', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/enquiries/${enquiryId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        remarks: 'Should fail',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
