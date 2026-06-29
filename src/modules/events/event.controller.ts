import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  calendarQuerySchema,
  createEventSchema,
  listEventsQuerySchema,
  saveMenuSelectionSchema,
  updateEventSchema,
} from './event.schema.js';
import type { EventService } from './event.service.js';

export class EventController {
  constructor(private readonly eventService: EventService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listEventsQuerySchema.parse(request.query);
    const result = await this.eventService.list(query);

    return reply.send(successResponse(result));
  }

  async calendar(request: FastifyRequest, reply: FastifyReply) {
    const query = calendarQuerySchema.parse(request.query);
    const events = await this.eventService.getCalendar(query);

    return reply.send(successResponse(events));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const event = await this.eventService.getById(id);

    return reply.send(successResponse(event));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createEventSchema.parse(request.body);
    const event = await this.eventService.create(input);

    return reply.status(201).send(successResponse(event));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateEventSchema.parse(request.body);
    const event = await this.eventService.update(id, input);

    return reply.send(successResponse(event));
  }

  async saveMenuSelection(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = saveMenuSelectionSchema.parse(request.body);
    const event = await this.eventService.saveMenuSelection(id, input);

    return reply.send(successResponse(event));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.eventService.delete(id);

    return reply.send(successResponse(result));
  }
}
