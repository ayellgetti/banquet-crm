import { EventStatus, TimeSlot } from '@prisma/client';
import { z } from 'zod';
import { optionalNullableString } from '../../shared/zod.js';
import { isValidIndianMobile, normalizeMobile } from '../../utils/mobile.js';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .transform(normalizeMobile)
  .refine(isValidIndianMobile, 'Mobile number must be a valid 10-digit Indian number');

export const createLeadSchema = z.object({
  firstName: z.string().min(1).max(150),
  lastName: z.string().min(1).max(150),
  mobileNo: mobileSchema,
  eventType: z.string().min(1).max(100),
  eventDate: dateStringSchema,
  timeSlot: z.nativeEnum(TimeSlot).optional().nullable(),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
  venue: optionalNullableString(255),
  menuPackage: optionalNullableString(255),
  leadSource: optionalNullableString(100),
  approxBudget: z.coerce.number().nonnegative().optional().nullable(),
  decorationRequired: z.boolean().optional(),
  specialRequirements: z.string().optional().nullable().transform((value) => value ?? null),
  remarks: z.string().optional().nullable().transform((value) => value ?? null),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export interface LeadResponse {
  customerId: string;
  enquiryId: string;
  eventId: string;
  status: EventStatus;
}
