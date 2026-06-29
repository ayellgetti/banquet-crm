import { EventStatus, LeadStatus, TimeSlot } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { optionalNullablePlatePackageId, optionalNullableString } from '../../shared/zod.js';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

export const listEnquiriesQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(LeadStatus).optional(),
  customerId: idStringSchema.optional(),
});

export const createEnquirySchema = z.object({
  customerId: idStringSchema,
  enquiryDate: dateStringSchema.optional(),
  leadSource: z.string().max(100).optional().nullable().transform((value) => value ?? null),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedTo: idStringSchema.optional().nullable(),
  remarks: z.string().optional().nullable().transform((value) => value ?? null),
});

export const updateEnquirySchema = z
  .object({
    customerId: idStringSchema.optional(),
    enquiryDate: dateStringSchema.optional(),
    leadSource: z.string().max(100).optional().nullable(),
    status: z.nativeEnum(LeadStatus).optional(),
    assignedTo: idStringSchema.optional().nullable(),
    remarks: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine((data) => data.status !== LeadStatus.CONVERTED, {
    message: 'Use the convert endpoint to mark an enquiry as converted',
  });

export const convertEnquirySchema = z.object({
  eventType: z.string().min(1).max(100),
  eventDate: dateStringSchema,
  timeSlot: z.nativeEnum(TimeSlot).optional().nullable(),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
  venue: optionalNullableString(255),
  menuPackage: optionalNullableString(255),
  platePackageId: optionalNullablePlatePackageId(),
  approxBudget: z.coerce.number().nonnegative().optional().nullable(),
  decorationRequired: z.boolean().optional(),
  referenceBy: z.string().max(255).optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  status: z.nativeEnum(EventStatus).optional(),
});

export type ListEnquiriesQuery = z.infer<typeof listEnquiriesQuerySchema>;
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
export type ConvertEnquiryInput = z.infer<typeof convertEnquirySchema>;

export function parseOptionalBigInt(value: string | null | undefined): bigint | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return BigInt(value);
}

export function parseRequiredBigInt(value: string): bigint {
  return BigInt(value);
}
