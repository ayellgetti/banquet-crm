import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/response.js';
import { createLeadSchema } from './lead.schema.js';
import type { LeadService } from './lead.service.js';

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  async createPublic(request: FastifyRequest, reply: FastifyReply) {
    const input = createLeadSchema.parse(request.body);
    const result = await this.leadService.createLead(input);
    return reply.status(201).send(successResponse(result));
  }

  async createAuthenticated(request: FastifyRequest, reply: FastifyReply) {
    const input = createLeadSchema.parse(request.body);
    const result = await this.leadService.createLead(input);
    return reply.status(201).send(successResponse(result));
  }
}
