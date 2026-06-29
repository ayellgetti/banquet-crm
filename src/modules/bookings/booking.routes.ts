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
import { BookingController } from './booking.controller.js';
import { BookingRepository } from './booking.repository.js';
import { BookingService } from './booking.service.js';

export async function bookingRoutes(app: FastifyInstance) {
  const repository = new BookingRepository(app.prisma);
  const service = new BookingService(repository, app.prisma);
  const controller = new BookingController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.bookings],
      summary: 'List bookings',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.bookings],
      summary: 'Create booking',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.bookings],
      summary: 'Get booking by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.bookings],
      summary: 'Update booking',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.bookings],
      summary: 'Delete booking',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
