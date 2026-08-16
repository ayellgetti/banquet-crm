import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { ApiTags, bearerAuth, createdResponse, okResponse, paginationQuery } from '../../shared/openapi.js';
import { DirectoryContactController } from './directory-contact.controller.js';
import { DirectoryContactRepository } from './directory-contact.repository.js';
import { DirectoryContactService } from './directory-contact.service.js';

export async function directoryContactRoutes(app: FastifyInstance) {
  const repository = new DirectoryContactRepository(app.prisma);
  const service = new DirectoryContactService(repository);
  const controller = new DirectoryContactController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.contacts],
      summary: 'List directory contacts (employee / other)',
      security: bearerAuth,
      querystring: {
        allOf: [
          paginationQuery,
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['EMPLOYEE', 'OTHER'] },
            },
          },
        ],
      },
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.contacts],
      summary: 'Create directory contact (employee / other)',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });
}
