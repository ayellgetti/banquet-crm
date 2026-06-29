import { z } from 'zod';

/** Optional string fields stored as null when omitted, empty, or whitespace-only. */
export function optionalNullableString(maxLength: number) {
  return z
    .string()
    .max(maxLength)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null) {
        return null;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    });
}

export function optionalNullablePlatePackageId() {
  return z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null) {
        return null;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    });
}
