import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createBookingSchema,
  listBookingsQuerySchema,
  updateBookingSchema,
} from './booking.schema.js';
import type { BookingService } from './booking.service.js';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listBookingsQuerySchema.parse(request.query);
    const result = await this.bookingService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const booking = await this.bookingService.getById(id);

    return reply.send(successResponse(booking));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createBookingSchema.parse(request.body);
    const booking = await this.bookingService.create(input);

    return reply.status(201).send(successResponse(booking));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateBookingSchema.parse(request.body);
    const booking = await this.bookingService.update(id, input);

    return reply.send(successResponse(booking));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.bookingService.delete(id);

    return reply.send(successResponse(result));
  }
}
