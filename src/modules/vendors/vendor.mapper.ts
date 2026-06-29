import type { Vendor, VendorCategory } from '@prisma/client';
import type { VendorResponse } from './vendor.types.js';

type VendorWithCategory = Vendor & {
  category: VendorCategory | null;
};

export function toVendorResponse(vendor: VendorWithCategory): VendorResponse {
  return {
    id: vendor.id.toString(),
    categoryId: vendor.categoryId?.toString() ?? null,
    vendorName: vendor.vendorName,
    mobile: vendor.mobile,
    email: vendor.email,
    address: vendor.address,
    gstNumber: vendor.gstNumber,
    notes: vendor.notes,
    createdAt: vendor.createdAt.toISOString(),
    category: vendor.category
      ? {
          id: vendor.category.id.toString(),
          categoryName: vendor.category.categoryName,
        }
      : null,
  };
}
