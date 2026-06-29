import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createInvoiceSchema,
  listInvoicesQuerySchema,
  updateInvoiceSchema,
} from './invoice.schema.js';
import type { InvoiceService } from './invoice.service.js';

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listInvoicesQuerySchema.parse(request.query);
    const result = await this.invoiceService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const invoice = await this.invoiceService.getById(id);

    return reply.send(successResponse(invoice));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createInvoiceSchema.parse(request.body);
    const invoice = await this.invoiceService.create(input, request.user?.id);

    return reply.status(201).send(successResponse(invoice));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateInvoiceSchema.parse(request.body);
    const invoice = await this.invoiceService.update(id, input);

    return reply.send(successResponse(invoice));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.invoiceService.delete(id);

    return reply.send(successResponse(result));
  }
}
