import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ApiTags, bearerAuth, createdResponse } from '../../shared/openapi.js';
import { LeadController } from './lead.controller.js';
import { assertLeadApiKey, LeadService } from './lead.service.js';

async function verifyPublicLeadAccess(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers['x-lead-api-key'];
  const value = Array.isArray(header) ? header[0] : header;

  try {
    assertLeadApiKey(value);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Invalid lead API key', 401);
  }
}

export async function leadRoutes(app: FastifyInstance) {
  const service = new LeadService(app.prisma);
  const controller = new LeadController(service);

  app.post('/public/leads', {
    preHandler: [verifyPublicLeadAccess],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Create lead from public enquiry form',
      response: createdResponse('Lead created with customer, enquiry, and tentative event'),
    },
    handler: (request, reply) => controller.createPublic(request, reply),
  });

  app.post('/leads', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.enquiries],
      summary: 'Create lead from authenticated admin enquiry form',
      security: bearerAuth,
      response: createdResponse('Lead created with customer, enquiry, and tentative event'),
    },
    handler: (request, reply) => controller.createAuthenticated(request, reply),
  });
}
