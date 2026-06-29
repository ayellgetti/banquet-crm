import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createPaymentSchema,
  listPaymentsQuerySchema,
  paymentReportQuerySchema,
  updatePaymentSchema,
} from './payment.schema.js';
import type { PaymentService } from './payment.service.js';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listPaymentsQuerySchema.parse(request.query);
    const result = await this.paymentService.list(query);

    return reply.send(successResponse(result));
  }

  async income(request: FastifyRequest, reply: FastifyReply) {
    const query = paymentReportQuerySchema.parse(request.query);
    const result = await this.paymentService.getIncomeReport(query);

    return reply.send(successResponse(result));
  }

  async expense(request: FastifyRequest, reply: FastifyReply) {
    const query = paymentReportQuerySchema.parse(request.query);
    const result = await this.paymentService.getExpenseReport(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const payment = await this.paymentService.getById(id);

    return reply.send(successResponse(payment));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createPaymentSchema.parse(request.body);
    const payment = await this.paymentService.create(input, request.user?.id);

    return reply.status(201).send(successResponse(payment));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updatePaymentSchema.parse(request.body);
    const payment = await this.paymentService.update(id, input);

    return reply.send(successResponse(payment));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.paymentService.delete(id);

    return reply.send(successResponse(result));
  }
}
