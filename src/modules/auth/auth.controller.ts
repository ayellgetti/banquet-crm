import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/response.js';
import { loginSchema, logoutSchema, refreshSchema } from './auth.schema.js';
import type { AuthService } from './auth.service.js';
import type { TokenMeta } from './auth.types.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const meta = this.extractTokenMeta(request);

    const result = await this.authService.login(input, meta);

    return reply.send(successResponse(result));
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const input = refreshSchema.parse(request.body);
    const meta = this.extractTokenMeta(request);

    const result = await this.authService.refresh(input, meta);

    return reply.send(successResponse(result));
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const input = logoutSchema.parse(request.body);

    const result = await this.authService.logout(input);

    return reply.send(successResponse(result));
  }

  private extractTokenMeta(request: FastifyRequest): TokenMeta {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }
}
