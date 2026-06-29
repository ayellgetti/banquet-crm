import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { isValidIndianMobile, normalizeMobile } from '../../utils/mobile.js';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .transform(normalizeMobile)
  .refine(isValidIndianMobile, 'Mobile number must be a valid 10-digit Indian number');

const emailSchema = z
  .string()
  .email('Invalid email')
  .optional()
  .nullable()
  .transform((value) => value ?? null);

export const listUsersQuerySchema = paginationQuerySchema;

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(150),
  lastName: z.string().min(1).max(150),
  dob: dateStringSchema,
  mobileNo: mobileSchema,
  email: emailSchema,
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(150).optional(),
    lastName: z.string().min(1).max(150).optional(),
    dob: dateStringSchema.optional(),
    mobileNo: mobileSchema.optional(),
    email: emailSchema,
    role: z.nativeEnum(UserRole).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
