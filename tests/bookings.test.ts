import { EventStatus, LeadStatus, PrismaClient } from '@prisma/client';
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

describe.skipIf(!dbAvailable)('Bookings API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let eventId: string;
  let bookingId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Booking',
        lastName: 'Test',
        mobileNo: '9444455556',
      },
    });

    const enquiry = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        status: LeadStatus.CONVERTED,
      },
    });

    const event = await prisma.event.create({
      data: {
        enquiryId: enquiry.id,
        customerId: customer.id,
        eventType: 'Anniversary',
        eventDate: new Date('2026-09-20'),
        status: EventStatus.CONFIRMED,
      },
    });

    eventId = event.id.toString();
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: '9444455556' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /bookings creates a booking with auto booking number', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/bookings',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        eventId,
        totalAmount: 150000,
        advanceAmount: 30000,
        discount: 5000,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.data.bookingNumber).toMatch(/^BK-\d{4}-\d{5}$/);
    expect(body.data.finalAmount).toBe('145000');
    expect(body.data.event.eventType).toBe('Anniversary');

    bookingId = body.data.id;
  });

  it('POST /bookings rejects duplicate event booking', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/bookings',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        eventId,
        totalAmount: 100000,
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it('GET /bookings lists bookings', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/bookings?search=BK-',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('GET /bookings/:id returns booking detail', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/bookings/${bookingId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(bookingId);
  });

  it('PATCH /bookings/:id recalculates final amount', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/bookings/${bookingId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        totalAmount: 160000,
        discount: 10000,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.finalAmount).toBe('150000');
  });

  it('DELETE /bookings/:id deletes a booking', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/bookings/${bookingId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('Booking deleted');
  });
});
