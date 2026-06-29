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
import { EnquiryController } from './enquiry.controller.js';
import { EnquiryRepository } from './enquiry.repository.js';
import { EnquiryService } from './enquiry.service.js';

export async function enquiryRoutes(app: FastifyInstance) {
  const repository = new EnquiryRepository(app.prisma);
  const service = new EnquiryService(repository, app.prisma);
  const controller = new EnquiryController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'List enquiries',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Create enquiry',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.post('/:id/convert', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Convert enquiry to event',
      security: bearerAuth,
      params: idParam,
      response: createdResponse('Returns created event and updated enquiry'),
    },
    handler: (request, reply) => controller.convert(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Get enquiry by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Update enquiry',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Delete enquiry',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });
}
