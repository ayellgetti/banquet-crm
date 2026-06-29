import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

let dbAvailable = false;

beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  } finally {
    await prisma.$disconnect();
  }
});

describe.skipIf(!dbAvailable)('Swagger', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /docs serves Swagger UI', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
  });

  it('GET /docs/json returns OpenAPI spec', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);

    const spec = response.json();
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info.title).toBe('Banquet CRM API');
    expect(spec.paths['/auth/login']).toBeDefined();
    expect(spec.paths['/dashboard']).toBeDefined();
  });
});
