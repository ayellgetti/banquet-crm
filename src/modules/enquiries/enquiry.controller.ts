import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  convertEnquirySchema,
  createEnquirySchema,
  listEnquiriesQuerySchema,
  updateEnquirySchema,
} from './enquiry.schema.js';
import type { EnquiryService } from './enquiry.service.js';

export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listEnquiriesQuerySchema.parse(request.query);
    const result = await this.enquiryService.list(query);

    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const enquiry = await this.enquiryService.getById(id);

    return reply.send(successResponse(enquiry));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createEnquirySchema.parse(request.body);
    const enquiry = await this.enquiryService.create(input);

    return reply.status(201).send(successResponse(enquiry));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = updateEnquirySchema.parse(request.body);
    const enquiry = await this.enquiryService.update(id, input);

    return reply.send(successResponse(enquiry));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const result = await this.enquiryService.delete(id);

    return reply.send(successResponse(result));
  }

  async convert(request: FastifyRequest, reply: FastifyReply) {
    const { id: idParam } = request.params as { id: string };
    const id = parseIdParam(idParam);
    const input = convertEnquirySchema.parse(request.body);
    const result = await this.enquiryService.convert(id, input);

    return reply.status(201).send(successResponse(result));
  }
}
