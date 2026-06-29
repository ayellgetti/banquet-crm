import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AccessTokenPayload } from '../modules/auth/auth.types.js';
import { AppError } from '../shared/errors/app-error.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = header.slice('Bearer '.length);

  try {
    request.user = request.server.tokenService.verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

export async function requireAdmin(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.user) {
    throw new AppError('Unauthorized', 401);
  }

  if (request.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }
}
