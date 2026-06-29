import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './user.schema.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listUsersQuerySchema.parse(request.query);
    const result = await this.userService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const user = await this.userService.getById(id);

    return reply.send(successResponse(user));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createUserSchema.parse(request.body);
    const user = await this.userService.create(input);

    return reply.status(201).send(successResponse(user));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateUserSchema.parse(request.body);

    const user = await this.userService.update(id, input);

    return reply.send(successResponse(user));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const actorId = this.getActorId(request);

    const result = await this.userService.delete(id, actorId);

    return reply.send(successResponse(result));
  }

  private getActorId(request: FastifyRequest): string {
    if (!request.user?.id) {
      throw new Error('Authenticated user is required');
    }

    return request.user.id;
  }
}
