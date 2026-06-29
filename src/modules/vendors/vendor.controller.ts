import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createVendorSchema,
  listVendorsQuerySchema,
  updateVendorSchema,
} from './vendor.schema.js';
import type { VendorService } from './vendor.service.js';

export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listVendorsQuerySchema.parse(request.query);
    const result = await this.vendorService.list(query);

    return reply.send(successResponse(result));
  }

  async listCategories(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.vendorService.listCategories();

    return reply.send(successResponse(categories));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const vendor = await this.vendorService.getById(id);

    return reply.send(successResponse(vendor));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createVendorSchema.parse(request.body);
    const vendor = await this.vendorService.create(input);

    return reply.status(201).send(successResponse(vendor));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateVendorSchema.parse(request.body);
    const vendor = await this.vendorService.update(id, input);

    return reply.send(successResponse(vendor));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.vendorService.delete(id);

    return reply.send(successResponse(result));
  }
}
