import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { ApiTags, bearerAuth, okResponse } from '../../shared/openapi.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

export async function dashboardRoutes(app: FastifyInstance) {
  const service = new DashboardService(app.prisma);
  const controller = new DashboardController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.dashboard],
      summary: 'Dashboard metrics',
      security: bearerAuth,
      response: okResponse('Returns events, follow-ups, revenue, and lead metrics'),
    },
    handler: (request, reply) => controller.getDashboard(request, reply),
  });
}
