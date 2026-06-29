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
import { VendorController } from './vendor.controller.js';
import { VendorRepository } from './vendor.repository.js';
import { VendorService } from './vendor.service.js';

export async function vendorRoutes(app: FastifyInstance) {
  const repository = new VendorRepository(app.prisma);
  const service = new VendorService(repository, app.prisma);
  const controller = new VendorController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'List vendors',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.get('/categories', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'List vendor categories',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.listCategories(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'Create vendor',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'Get vendor by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'Update vendor',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.vendors],
      summary: 'Delete vendor',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
