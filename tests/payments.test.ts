import {
  EventStatus,
  LeadStatus,
  PaymentMode,
  PaymentType,
  PrismaClient,
} from '@prisma/client';
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

describe.skipIf(!dbAvailable)('Payments API', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let bookingId: string;
  let incomePaymentId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await loginAsAdmin(app);

    const prisma = new PrismaClient();
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Payment',
        lastName: 'Test',
        mobileNo: '9555566667',
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
        eventType: 'Corporate',
        eventDate: new Date('2026-10-05'),
        status: EventStatus.CONFIRMED,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        eventId: event.id,
        bookingNumber: 'BK-2026-99999',
        totalAmount: 200000,
        finalAmount: 200000,
      },
    });

    bookingId = booking.id.toString();
    await prisma.$disconnect();
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.customer.deleteMany({ where: { mobileNo: '9555566667' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /payments creates an income payment', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/payments',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        bookingId,
        paymentType: PaymentType.INCOME,
        transactionType: 'Advance',
        paymentMode: PaymentMode.UPI,
        amount: 50000,
        receivedFrom: 'Payment Test',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.paymentType).toBe('INCOME');
    expect(response.json().data.createdBy).toBeTruthy();

    incomePaymentId = response.json().data.id;
  });

  it('GET /payments/income returns income report with total', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/payments/income',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.data.items.length).toBeGreaterThan(0);
    expect(Number(body.data.totalAmount)).toBeGreaterThan(0);
  });

  it('GET /payments lists payments', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/payments?bookingId=${bookingId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.items.length).toBeGreaterThan(0);
  });

  it('PATCH /payments/:id updates a payment', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/payments/${incomePaymentId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        description: 'Updated payment note',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.description).toBe('Updated payment note');
  });

  it('DELETE /payments/:id deletes a payment', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/payments/${incomePaymentId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toBe('Payment deleted');
  });
});
