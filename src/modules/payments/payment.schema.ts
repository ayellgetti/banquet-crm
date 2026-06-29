import { PaymentMode, PaymentType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const dateTimeSchema = z.string().datetime({ offset: true }).or(z.string().datetime());

const amountSchema = z.coerce.number().positive('Amount must be greater than zero');

export const listPaymentsQuerySchema = paginationQuerySchema.extend({
  paymentType: z.nativeEnum(PaymentType).optional(),
  bookingId: idStringSchema.optional(),
  vendorId: idStringSchema.optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const paymentReportQuerySchema = z
  .object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    paymentMode: z.nativeEnum(PaymentMode).optional(),
    bookingId: idStringSchema.optional(),
    vendorId: idStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }

      return true;
    },
    {
      message: 'from must be before or equal to to',
      path: ['to'],
    },
  );

export const createPaymentSchema = z.object({
  bookingId: idStringSchema.optional().nullable(),
  vendorId: idStringSchema.optional().nullable(),
  paymentType: z.nativeEnum(PaymentType),
  transactionType: z.string().max(100).optional().nullable().transform((v) => v ?? null),
  transactionDate: dateTimeSchema.optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional().nullable(),
  amount: amountSchema,
  description: z.string().optional().nullable().transform((v) => v ?? null),
  receivedFrom: z.string().max(255).optional().nullable().transform((v) => v ?? null),
  paidTo: z.string().max(255).optional().nullable().transform((v) => v ?? null),
});

export const updatePaymentSchema = z
  .object({
    bookingId: idStringSchema.optional().nullable(),
    vendorId: idStringSchema.optional().nullable(),
    paymentType: z.nativeEnum(PaymentType).optional(),
    transactionType: z.string().max(100).optional().nullable(),
    transactionDate: dateTimeSchema.optional(),
    paymentMode: z.nativeEnum(PaymentMode).optional().nullable(),
    amount: amountSchema.optional(),
    description: z.string().optional().nullable(),
    receivedFrom: z.string().max(255).optional().nullable(),
    paidTo: z.string().max(255).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type PaymentReportQuery = z.infer<typeof paymentReportQuerySchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

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
