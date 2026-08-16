import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/response.js';
import {
  createDirectoryContactSchema,
  listDirectoryContactsQuerySchema,
} from './directory-contact.schema.js';
import type { DirectoryContactService } from './directory-contact.service.js';

export class DirectoryContactController {
  constructor(private readonly service: DirectoryContactService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listDirectoryContactsQuerySchema.parse(request.query);
    const result = await this.service.list(query);
    return reply.send(successResponse(result));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createDirectoryContactSchema.parse(request.body);
    const contact = await this.service.create(input);
    return reply.status(201).send(successResponse(contact));
  }
}
