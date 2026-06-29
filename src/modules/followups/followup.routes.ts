import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import {
  ApiTags,
  bearerAuth,
  createdResponse,
  idParam,
  okResponse,
  paginationQuery,
} from '../../shared/openapi.js';
import { FollowupController } from './followup.controller.js';
import { FollowupRepository } from './followup.repository.js';
import { FollowupService } from './followup.service.js';

export async function followupRoutes(app: FastifyInstance) {
  const repository = new FollowupRepository(app.prisma);
  const service = new FollowupService(repository, app.prisma);
  const controller = new FollowupController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'List follow-ups',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/today', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Follow-ups due today',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.today(request, reply),
  });

  app.get('/pending', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Pending follow-ups',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.pending(request, reply),
  });

  app.get('/overdue', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Overdue follow-ups',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.overdue(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Create follow-up',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Update follow-up',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.followups],
      summary: 'Delete follow-up',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
