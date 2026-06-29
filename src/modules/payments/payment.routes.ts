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
import { PaymentController } from './payment.controller.js';
import { PaymentRepository } from './payment.repository.js';
import { PaymentService } from './payment.service.js';

export async function paymentRoutes(app: FastifyInstance) {
  const repository = new PaymentRepository(app.prisma);
  const service = new PaymentService(repository, app.prisma);
  const controller = new PaymentController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'List payments',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/income', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Income payment report',
      security: bearerAuth,
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date' },
          to: { type: 'string', format: 'date' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
      response: okResponse(),
    },
    handler: (request, reply) => controller.income(request, reply),
  });

  app.get('/expense', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Expense payment report',
      security: bearerAuth,
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date' },
          to: { type: 'string', format: 'date' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
      response: okResponse(),
    },
    handler: (request, reply) => controller.expense(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Create payment',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Get payment by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Update payment',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.payments],
      summary: 'Delete payment',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
