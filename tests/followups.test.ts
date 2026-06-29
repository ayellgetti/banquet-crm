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

describe.skipIf(!dbAvailable)('Followups API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let enquiryId: string;
  let followupId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Follow',
        lastName: 'Up',
        mobileNo: '9333344445',
      },
    });

    const enquiry = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        status: LeadStatus.FOLLOW_UP,
      },
    });

    enquiryId = enquiry.id.toString();
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: '9333344445' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /followups accepts date-only nextFollowupDate', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateOnly = tomorrow.toISOString().slice(0, 10);

    const response = await app.inject({
      method: 'POST',
      url: '/followups',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        enquiryId,
        nextFollowupDate: dateOnly,
        comments: 'Date-only follow-up',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.nextFollowupDate).toContain(dateOnly);
  });

  it('POST /followups updates enquiry status when enquiryStatus is provided', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/followups',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        enquiryId,
        comments: 'Status update via follow-up',
        enquiryStatus: LeadStatus.CONTACTED,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.enquiry.status).toBe(LeadStatus.CONTACTED);
  });

  it('POST /followups creates a follow-up', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await app.inject({
      method: 'POST',
      url: '/followups',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        enquiryId,
        nextFollowupDate: tomorrow.toISOString(),
        comments: 'Call back tomorrow',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.enquiry.id).toBe(enquiryId);

    followupId = response.json().data.id;
  });

  it('GET /followups lists follow-ups', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/followups?enquiryId=${enquiryId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('GET /followups/pending returns open follow-ups', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/followups/pending',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.json().data)).toBe(true);
  });

  it('PATCH /followups/:id updates a follow-up', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/followups/${followupId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        comments: 'Updated follow-up note',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.comments).toBe('Updated follow-up note');
  });

  it('DELETE /followups/:id deletes a follow-up', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/followups/${followupId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('Follow-up deleted');
  });
});
