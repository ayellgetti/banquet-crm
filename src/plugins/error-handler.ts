import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { isAppError } from '../shared/errors/app-error.js';
import { errorResponse } from '../shared/response.js';

type FastifyValidationError = Error & {
  statusCode?: number;
  code?: string;
  validation?: Array<{ message: string; instancePath?: string }>;
};

function isFastifyValidationError(error: Error): error is FastifyValidationError {
  return 'code' in error && (error as FastifyValidationError).code === 'FST_ERR_VALIDATION';
}

export function registerErrorHandler(app: {
  setErrorHandler: (
    handler: (
      error: Error,
      request: { log: { error: (obj: object, msg?: string) => void } },
      reply: { status: (code: number) => { send: (body: unknown) => void } },
    ) => void,
  ) => void;
}): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      reply.status(400).send(errorResponse('Validation failed', errors));
      return;
    }

    if (isFastifyValidationError(error)) {
      const errors =
        error.validation?.map((item) =>
          item.instancePath ? `${item.instancePath}: ${item.message}` : item.message,
        ) ?? [error.message];
      reply.status(400).send(errorResponse('Validation failed', errors));
      return;
    }

    if (isAppError(error)) {
      reply
        .status(error.statusCode)
        .send(errorResponse(error.message, error.errors));
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      request.log.error({ err: error, code: error.code }, 'Database error');

      if (error.code === 'P2002') {
        reply.status(409).send(errorResponse('A record with this value already exists'));
        return;
      }

      if (error.code === 'P2025') {
        reply.status(404).send(errorResponse('Record not found'));
        return;
      }

      reply.status(500).send(errorResponse('Database error'));
      return;
    }

    request.log.error({ err: error }, 'Unhandled error');
    reply.status(500).send(errorResponse('Internal server error'));
  });
}
