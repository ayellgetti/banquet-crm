import type { FastifyInstance } from 'fastify';
import { ApiTags, okResponse } from '../../shared/openapi.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

export async function authRoutes(app: FastifyInstance) {
  const repository = new AuthRepository(app.prisma);
  const service = new AuthService(repository, app.tokenService, app.prisma);
  const controller = new AuthController(service);

  app.post('/login', {
    schema: {
      tags: [ApiTags.auth],
      summary: 'Login with mobile username and password',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', description: 'Mobile number, e.g. 9999999999' },
          password: { type: 'string', minLength: 1 },
        },
      },
      response: okResponse('Returns access token, refresh token, and user profile'),
    },
    handler: (request, reply) => controller.login(request, reply),
  });

  app.post('/refresh', {
    schema: {
      tags: [ApiTags.auth],
      summary: 'Rotate refresh token and issue new access token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: okResponse('Returns new token pair'),
    },
    handler: (request, reply) => controller.refresh(request, reply),
  });

  app.post('/logout', {
    schema: {
      tags: [ApiTags.auth],
      summary: 'Revoke refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: okResponse('Logout successful'),
    },
    handler: (request, reply) => controller.logout(request, reply),
  });
}
