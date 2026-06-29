import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const amountSchema = z.coerce.number().nonnegative();

export const listBookingsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(BookingStatus).optional(),
  eventId: idStringSchema.optional(),
});

export const createBookingSchema = z.object({
  eventId: idStringSchema,
  bookingDate: dateStringSchema.optional(),
  totalAmount: amountSchema.default(0),
  advanceAmount: amountSchema.default(0),
  discount: amountSchema.default(0),
  status: z.nativeEnum(BookingStatus).optional(),
  comments: z.string().optional().nullable().transform((value) => value ?? null),
});

export const updateBookingSchema = z
  .object({
    bookingDate: dateStringSchema.optional(),
    totalAmount: amountSchema.optional(),
    advanceAmount: amountSchema.optional(),
    discount: amountSchema.optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    comments: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export function parseBigIntId(value: string): bigint {
  return BigInt(value);
}

export function calculateFinalAmount(totalAmount: number, discount: number): number {
  return Math.max(totalAmount - discount, 0);
}
