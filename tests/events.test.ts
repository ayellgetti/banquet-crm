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

describe.skipIf(!dbAvailable)('Events API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let enquiryId: string;
  let eventId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Event',
        lastName: 'Phase',
        mobileNo: '9222233334',
      },
    });

    const enquiry = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        leadSource: 'Referral',
        status: LeadStatus.NEGOTIATION,
      },
    });

    enquiryId = enquiry.id.toString();
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: '9222233334' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /events creates an event and converts enquiry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        enquiryId,
        eventType: 'Reception',
        eventDate: '2026-11-10',
        venue: 'Hall B',
        guestCount: 200,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.data.eventType).toBe('Reception');
    expect(body.data.customer.firstName).toBe('Event');

    eventId = body.data.id;
  });

  it('GET /events lists events', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events?search=Reception',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('GET /events/calendar returns events in date range', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events/calendar?from=2026-11-01&to=2026-11-30',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);

    const events = response.json().data;
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventDate).toBe('2026-11-10');
  });

  it('GET /events/:id returns event detail', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/events/${eventId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(eventId);
  });

  it('PATCH /events/:id updates an event', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${eventId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        status: 'CONFIRMED',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe('CONFIRMED');
  });

  it('DELETE /events/:id deletes an event', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/events/${eventId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('Event deleted');
  });
});
