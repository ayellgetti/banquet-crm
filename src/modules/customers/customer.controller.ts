import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createCustomerSchema,
  listCustomersQuerySchema,
  updateCustomerSchema,
} from './customer.schema.js';
import type { CustomerService } from './customer.service.js';

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listCustomersQuerySchema.parse(request.query);
    const result = await this.customerService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const customer = await this.customerService.getById(id);

    return reply.send(successResponse(customer));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createCustomerSchema.parse(request.body);
    const customer = await this.customerService.create(input);

    return reply.status(201).send(successResponse(customer));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateCustomerSchema.parse(request.body);
    const customer = await this.customerService.update(id, input);

    return reply.send(successResponse(customer));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.customerService.delete(id);

    return reply.send(successResponse(result));
  }
}
