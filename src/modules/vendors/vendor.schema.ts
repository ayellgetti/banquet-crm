import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const emailSchema = z
  .union([z.string().email('Invalid email'), z.null()])
  .optional()
  .transform((value) => value ?? null);

export const listVendorsQuerySchema = paginationQuerySchema.extend({
  categoryId: idStringSchema.optional(),
});

export const createVendorSchema = z.object({
  categoryId: idStringSchema.optional().nullable(),
  vendorName: z.string().min(1).max(255),
  mobile: z.string().max(20).optional().nullable().transform((v) => v ?? null),
  email: emailSchema,
  address: z.string().optional().nullable().transform((v) => v ?? null),
  gstNumber: z.string().max(50).optional().nullable().transform((v) => v ?? null),
  notes: z.string().optional().nullable().transform((v) => v ?? null),
});

export const updateVendorSchema = z
  .object({
    categoryId: idStringSchema.optional().nullable(),
    vendorName: z.string().min(1).max(255).optional(),
    mobile: z.string().max(20).optional().nullable(),
    email: emailSchema,
    address: z.string().optional().nullable(),
    gstNumber: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

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
