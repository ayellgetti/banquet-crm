import { InventoryStatus, InventoryType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const listInventoryQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(InventoryStatus).optional(),
  inventoryType: z.nativeEnum(InventoryType).optional(),
  vendorId: idStringSchema.optional(),
});

export const createInventorySchema = z.object({
  vendorId: idStringSchema.optional().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable().transform((v) => v ?? null),
  category: z.string().max(100).optional().nullable().transform((v) => v ?? null),
  quantity: z.coerce.number().nonnegative().optional().nullable(),
  unit: z.string().max(50).optional().nullable().transform((v) => v ?? null),
  purchasePrice: z.coerce.number().nonnegative().optional().nullable(),
  purchaseDate: dateStringSchema.optional().nullable(),
  deliveryDate: dateStringSchema.optional().nullable(),
  inventoryType: z.nativeEnum(InventoryType).optional(),
  status: z.nativeEnum(InventoryStatus).optional(),
});

export const updateInventorySchema = z
  .object({
    vendorId: idStringSchema.optional().nullable(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    category: z.string().max(100).optional().nullable(),
    quantity: z.coerce.number().nonnegative().optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    purchasePrice: z.coerce.number().nonnegative().optional().nullable(),
    purchaseDate: dateStringSchema.optional().nullable(),
    deliveryDate: dateStringSchema.optional().nullable(),
    inventoryType: z.nativeEnum(InventoryType).optional(),
    status: z.nativeEnum(InventoryStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export function parseOptionalBigInt(value: string | null | undefined): bigint | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return BigInt(value);
}
