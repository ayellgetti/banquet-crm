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
import { CustomerController } from './customer.controller.js';
import { CustomerRepository } from './customer.repository.js';
import { CustomerService } from './customer.service.js';

export async function customerRoutes(app: FastifyInstance) {
  const repository = new CustomerRepository(app.prisma);
  const service = new CustomerService(repository);
  const controller = new CustomerController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.customers],
      summary: 'List customers',
      security: bearerAuth,
      querystring: {
        allOf: [
          paginationQuery,
          {
            type: 'object',
            properties: {
              mobile: { type: 'string', description: 'Filter by mobile number' },
            },
          },
        ],
      },
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.customers],
      summary: 'Get customer by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.customers],
      summary: 'Create customer',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.customers],
      summary: 'Update customer',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.customers],
      summary: 'Delete customer',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
