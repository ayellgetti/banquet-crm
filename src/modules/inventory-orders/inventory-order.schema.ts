import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const lineItemSchema = z.object({
  materialId: z.string().trim().min(1).max(120),
  materialName: z.string().trim().min(1).max(255),
  materialCategory: z.string().max(100).optional().nullable().transform((v) => v ?? null),
  unit: z.string().trim().min(1).max(50),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
});

export const listInventoryOrdersQuerySchema = paginationQuerySchema.extend({
  vendorId: idStringSchema.optional(),
  eventId: idStringSchema.optional(),
  status: z.enum(['PLACED', 'DELIVERED', 'CANCELLED']).optional(),
});

export const createInventoryOrderSchema = z.object({
  vendorId: idStringSchema,
  eventId: idStringSchema.optional().nullable(),
  deliveryAt: z.string().datetime({ message: 'Invalid delivery date/time' }),
  notes: z.string().optional().nullable().transform((v) => v ?? null),
  lineItems: z.array(lineItemSchema).min(1, 'At least one material is required'),
});

export type ListInventoryOrdersQuery = z.infer<typeof listInventoryOrdersQuerySchema>;
export type CreateInventoryOrderInput = z.infer<typeof createInventoryOrderSchema>;

export function parseBigIntId(value: string): bigint {
  return BigInt(value);
}

export function parseOptionalBigInt(value: string | null | undefined): bigint | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return BigInt(value);
}
