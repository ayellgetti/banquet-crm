import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createFollowupSchema,
  listFollowupsQuerySchema,
  updateFollowupSchema,
} from './followup.schema.js';
import type { FollowupService } from './followup.service.js';

export class FollowupController {
  constructor(private readonly followupService: FollowupService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listFollowupsQuerySchema.parse(request.query);
    const result = await this.followupService.list(query);

    return reply.send(successResponse(result));
  }

  async today(_request: FastifyRequest, reply: FastifyReply) {
    const followups = await this.followupService.getToday();
    return reply.send(successResponse(followups));
  }

  async pending(_request: FastifyRequest, reply: FastifyReply) {
    const followups = await this.followupService.getPending();
    return reply.send(successResponse(followups));
  }

  async overdue(_request: FastifyRequest, reply: FastifyReply) {
    const followups = await this.followupService.getOverdue();
    return reply.send(successResponse(followups));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createFollowupSchema.parse(request.body);
    const followup = await this.followupService.create(input);

    return reply.status(201).send(successResponse(followup));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateFollowupSchema.parse(request.body);
    const followup = await this.followupService.update(id, input);

    return reply.send(successResponse(followup));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.followupService.delete(id);

    return reply.send(successResponse(result));
  }
}
