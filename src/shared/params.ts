import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid id'),
});

export function parseIdParam(id: string): bigint {
  return BigInt(idParamSchema.shape.id.parse(id));
}
