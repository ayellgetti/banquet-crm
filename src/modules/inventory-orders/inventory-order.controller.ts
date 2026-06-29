import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createInventoryOrderSchema,
  listInventoryOrdersQuerySchema,
} from './inventory-order.schema.js';
import type { InventoryOrderService } from './inventory-order.service.js';

export class InventoryOrderController {
  constructor(private readonly inventoryOrderService: InventoryOrderService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listInventoryOrdersQuerySchema.parse(request.query);
    const result = await this.inventoryOrderService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const order = await this.inventoryOrderService.getById(id);

    return reply.send(successResponse(order));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createInventoryOrderSchema.parse(request.body);
    const order = await this.inventoryOrderService.create(input, request.user?.id);

    return reply.status(201).send(successResponse(order));
  }
}
