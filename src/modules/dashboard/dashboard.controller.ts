import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/response.js';
import type { DashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getDashboard(_request: FastifyRequest, reply: FastifyReply) {
    const dashboard = await this.dashboardService.getDashboard();

    return reply.send(successResponse(dashboard));
  }
}
