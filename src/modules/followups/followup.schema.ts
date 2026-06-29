import { CommunicationType, LeadStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const idStringSchema = z.string().regex(/^\d+$/, 'Invalid id');

/** Accepts YYYY-MM-DD or ISO-8601 datetimes (with or without offset). */
export const flexibleDateTimeSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) ||
      z.string().datetime({ offset: true }).safeParse(value).success ||
      z.string().datetime().safeParse(value).success,
    { message: 'Invalid datetime' },
  )
  .transform((value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return `${value}T09:00:00.000Z`;
    }

    return value;
  });

export const listFollowupsQuerySchema = paginationQuerySchema.extend({
  enquiryId: idStringSchema.optional(),
  eventId: idStringSchema.optional(),
});

export const createFollowupSchema = z.object({
  enquiryId: idStringSchema,
  eventId: idStringSchema.optional().nullable(),
  followupDate: flexibleDateTimeSchema.optional(),
  nextFollowupDate: flexibleDateTimeSchema.optional().nullable(),
  communicationType: z.nativeEnum(CommunicationType).optional().nullable(),
  comments: z.string().optional().nullable().transform((value) => value ?? null),
  followedBy: idStringSchema.optional().nullable(),
  enquiryStatus: z.nativeEnum(LeadStatus).optional(),
});

export const updateFollowupSchema = z
  .object({
    eventId: idStringSchema.optional().nullable(),
    followupDate: flexibleDateTimeSchema.optional(),
    nextFollowupDate: flexibleDateTimeSchema.optional().nullable(),
    communicationType: z.nativeEnum(CommunicationType).optional().nullable(),
    comments: z.string().optional().nullable(),
    followedBy: idStringSchema.optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListFollowupsQuery = z.infer<typeof listFollowupsQuerySchema>;
export type CreateFollowupInput = z.infer<typeof createFollowupSchema>;
export type UpdateFollowupInput = z.infer<typeof updateFollowupSchema>;

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
