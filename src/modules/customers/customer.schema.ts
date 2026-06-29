import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';
import { isValidIndianMobile, normalizeMobile } from '../../utils/mobile.js';

const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .transform(normalizeMobile)
  .refine(isValidIndianMobile, 'Mobile number must be a valid 10-digit Indian number');

const optionalMobileSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return normalizeMobile(value);
  })
  .refine(
    (value) => value === null || isValidIndianMobile(value),
    'Alternate mobile must be a valid 10-digit Indian number',
  );

const emailSchema = z
  .union([z.string().email('Invalid email'), z.null()])
  .optional()
  .transform((value) => value ?? null);

export const listCustomersQuerySchema = paginationQuerySchema.extend({
  mobile: z
    .string()
    .optional()
    .transform((value) => (value ? normalizeMobile(value) : undefined)),
});

export const createCustomerSchema = z.object({
  firstName: z.string().min(1).max(150),
  lastName: z.string().min(1).max(150),
  mobileNo: mobileSchema,
  alternateMobileNo: optionalMobileSchema,
  emailId: emailSchema,
  address: z.string().optional().nullable().transform((value) => value ?? null),
  city: z.string().max(100).optional().nullable().transform((value) => value ?? null),
  state: z.string().max(100).optional().nullable().transform((value) => value ?? null),
  pincode: z.string().max(20).optional().nullable().transform((value) => value ?? null),
});

export const updateCustomerSchema = z
  .object({
    firstName: z.string().min(1).max(150).optional(),
    lastName: z.string().min(1).max(150).optional(),
    mobileNo: mobileSchema.optional(),
    alternateMobileNo: optionalMobileSchema,
    emailId: emailSchema,
    address: z.string().optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    pincode: z.string().max(20).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
