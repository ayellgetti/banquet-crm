import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';

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

describe.skipIf(!dbAvailable)('Auth API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns tokens and user profile', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeTypeOf('string');
    expect(body.data.refreshToken).toBeTypeOf('string');
    expect(body.data.user.username).toBe(ADMIN_USERNAME);
    expect(body.data.user.role).toBe('ADMIN');
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: ADMIN_USERNAME,
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().success).toBe(false);
  });

  it('POST /auth/refresh rotates refresh token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      },
    });

    const loginBody = loginResponse.json();
    const { refreshToken } = loginBody.data;

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(refreshResponse.statusCode).toBe(200);

    const refreshBody = refreshResponse.json();
    expect(refreshBody.data.accessToken).toBeTypeOf('string');
    expect(refreshBody.data.refreshToken).toBeTypeOf('string');
    expect(refreshBody.data.refreshToken).not.toBe(refreshToken);

    const replayResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(replayResponse.statusCode).toBe(401);
  });

  it('POST /auth/logout revokes refresh token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      },
    });

    const { refreshToken } = loginResponse.json().data;

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      payload: { refreshToken },
    });

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.json().data.message).toBe('Logged out');

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(refreshResponse.statusCode).toBe(401);
  });
});

describe('TokenService', () => {
  it('unit: sign and verify access token', async () => {
    const { loadEnv } = await import('../src/config/env.js');
    const { TokenService } = await import('../src/modules/auth/token.service.js');

    const tokenService = new TokenService(loadEnv());
    const payload = {
      id: '1',
      username: '9999999999',
      role: 'ADMIN' as const,
    };

    const token = tokenService.signAccessToken(payload);
    const verified = tokenService.verifyAccessToken(token);

    expect(verified).toEqual(payload);
  });
});
