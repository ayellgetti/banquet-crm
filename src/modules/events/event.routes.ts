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
import { EventController } from './event.controller.js';
import { EventRepository } from './event.repository.js';
import { EventService } from './event.service.js';

export async function eventRoutes(app: FastifyInstance) {
  const repository = new EventRepository(app.prisma);
  const service = new EventService(repository, app.prisma);
  const controller = new EventController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'List events',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/calendar', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Get events for calendar date range',
      security: bearerAuth,
      querystring: {
        type: 'object',
        required: ['from', 'to'],
        properties: {
          from: { type: 'string', format: 'date' },
          to: { type: 'string', format: 'date' },
          status: { type: 'string' },
        },
      },
      response: okResponse(),
    },
    handler: (request, reply) => controller.calendar(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Create event',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Get event by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.put('/:id/menu-selection', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Save final menu selection for event',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.saveMenuSelection(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Update event',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.events],
      summary: 'Delete event',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
