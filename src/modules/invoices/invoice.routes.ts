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
import { InvoiceController } from './invoice.controller.js';
import { InvoiceRepository } from './invoice.repository.js';
import { InvoiceService } from './invoice.service.js';

export async function invoiceRoutes(app: FastifyInstance) {
  const repository = new InvoiceRepository(app.prisma);
  const service = new InvoiceService(repository, app.prisma);
  const controller = new InvoiceController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.invoices],
      summary: 'List invoices',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.invoices],
      summary: 'Create invoice',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.invoices],
      summary: 'Get invoice by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.invoices],
      summary: 'Update invoice',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.invoices],
      summary: 'Delete invoice',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
