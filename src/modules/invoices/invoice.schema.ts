import { InvoiceDiscountType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const amountSchema = z.coerce.number().min(0);

const lineItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  rate: amountSchema,
});

export const listInvoicesQuerySchema = paginationQuerySchema.extend({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  bookingId: idStringSchema.optional(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1).max(50),
  invoiceDate: dateStringSchema,
  dueDate: dateStringSchema.optional().nullable(),
  businessName: z.string().trim().min(1).max(120),
  businessAddress: z.string().optional().nullable().transform((v) => v ?? null),
  businessPhone: z.string().max(20).optional().nullable().transform((v) => v ?? null),
  businessEmail: z.string().email().max(255).optional().nullable().or(z.literal('')).transform((v) => v || null),
  authorizedSignatory: z.string().max(80).optional().nullable().transform((v) => v ?? null),
  paymentInfo: z.string().optional().nullable().transform((v) => v ?? null),
  customerName: z.string().trim().min(1).max(100),
  customerAddress: z.string().optional().nullable().transform((v) => v ?? null),
  customerPhone: z.string().max(20).optional().nullable().transform((v) => v ?? null),
  customerEmail: z.string().email().max(255).optional().nullable().or(z.literal('')).transform((v) => v || null),
  discountType: z.enum(['percent', 'fixed']).default('percent'),
  discountPercent: amountSchema.optional().default(0),
  discountAmount: amountSchema.optional().default(0),
  notes: z.string().optional().nullable().transform((v) => v ?? null),
  bookingId: idStringSchema.optional().nullable(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export function mapDiscountType(type: CreateInvoiceInput['discountType']): InvoiceDiscountType {
  return type === 'fixed' ? InvoiceDiscountType.FIXED : InvoiceDiscountType.PERCENT;
}

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

export function calcInvoiceAmounts(input: {
  lineItems: Array<{ quantity: number; rate: number }>;
  discountType: CreateInvoiceInput['discountType'];
  discountPercent: number;
  discountAmount: number;
}) {
  const subtotal = input.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const rawDiscount =
    input.discountType === 'fixed'
      ? input.discountAmount
      : Math.round((subtotal * input.discountPercent) / 100);
  const discount = Math.max(0, Math.min(subtotal, rawDiscount));
  const totalAmount = subtotal - discount;

  return { subtotal, discount, totalAmount };
}
