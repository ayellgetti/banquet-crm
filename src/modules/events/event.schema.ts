import { EventStatus, TimeSlot } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { optionalNullablePlatePackageId, optionalNullableString } from '../../shared/zod.js';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

const eventFieldsSchema = {
  eventType: z.string().min(1).max(100),
  eventDate: dateStringSchema,
  timeSlot: z.nativeEnum(TimeSlot).optional().nullable(),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
  venue: optionalNullableString(255),
  menuPackage: optionalNullableString(255),
  approxBudget: z.coerce.number().nonnegative().optional().nullable(),
  decorationRequired: z.boolean().optional(),
  referenceBy: z.string().max(255).optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  status: z.nativeEnum(EventStatus).optional(),
};

export const listEventsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(EventStatus).optional(),
  customerId: idStringSchema.optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const calendarQuerySchema = z
  .object({
    from: dateStringSchema,
    to: dateStringSchema,
    status: z.nativeEnum(EventStatus).optional(),
  })
  .refine((data) => data.from <= data.to, {
    message: 'from must be before or equal to to',
    path: ['to'],
  });

export const createEventSchema = z.object({
  enquiryId: idStringSchema,
  customerId: idStringSchema.optional(),
  ...eventFieldsSchema,
});

export const updateEventSchema = z
  .object({
    eventType: z.string().min(1).max(100).optional(),
    eventDate: dateStringSchema.optional(),
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
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const saveMenuSelectionSchema = z.object({
  platePackageId: z.string().min(1).max(50),
  menuItemIds: z.array(z.string().min(1).max(120)).min(1, 'At least one menu item is required'),
  menuPackage: z.string().max(255).optional().nullable(),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
});

export type SaveMenuSelectionInput = z.infer<typeof saveMenuSelectionSchema>;

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export function parseBigIntId(value: string): bigint {
  return BigInt(value);
}
