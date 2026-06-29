import type { FastifyInstance } from 'fastify';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  ApiTags,
  bearerAuth,
  createdResponse,
  idParam,
  okResponse,
  paginationQuery,
} from '../../shared/openapi.js';
import { UserController } from './user.controller.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

export async function userRoutes(app: FastifyInstance) {
  const repository = new UserRepository(app.prisma);
  const service = new UserService(repository);
  const controller = new UserController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.users],
      summary: 'List users',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.users],
      summary: 'Get user by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: [ApiTags.users],
      summary: 'Create user (admin only)',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: [ApiTags.users],
      summary: 'Update user (admin only)',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: [ApiTags.users],
      summary: 'Delete user (admin only)',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
