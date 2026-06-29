import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createInventorySchema,
  listInventoryQuerySchema,
  updateInventorySchema,
} from './inventory.schema.js';
import type { InventoryService } from './inventory.service.js';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listInventoryQuerySchema.parse(request.query);
    const result = await this.inventoryService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const item = await this.inventoryService.getById(id);

    return reply.send(successResponse(item));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createInventorySchema.parse(request.body);
    const item = await this.inventoryService.create(input);

    return reply.status(201).send(successResponse(item));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateInventorySchema.parse(request.body);
    const item = await this.inventoryService.update(id, input);

    return reply.send(successResponse(item));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.inventoryService.delete(id);

    return reply.send(successResponse(result));
  }
}
