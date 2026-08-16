import { z } from 'zod';
import { DirectoryContactType } from '@prisma/client';
import { paginationQuerySchema } from '../../shared/pagination.js';

const optionalEmailSchema = z
  .union([z.string().email('Invalid email'), z.null(), z.literal('')])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') return null;
    return value;
  });

export const listDirectoryContactsQuerySchema = paginationQuerySchema.extend({
  type: z.nativeEnum(DirectoryContactType).optional(),
});

export const createDirectoryContactSchema = z.object({
  type: z.nativeEnum(DirectoryContactType),
  name: z.string().min(1).max(255),
  mobile: z.string().max(20).optional().nullable().transform((v) => v?.trim() || null),
  email: optionalEmailSchema,
  address: z.string().optional().nullable().transform((v) => v?.trim() || null),
  notes: z.string().optional().nullable().transform((v) => v?.trim() || null),
});

export type ListDirectoryContactsQuery = z.infer<typeof listDirectoryContactsQuerySchema>;
export type CreateDirectoryContactInput = z.infer<typeof createDirectoryContactSchema>;
