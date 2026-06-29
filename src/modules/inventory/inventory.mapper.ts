import type { Inventory, Vendor } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { InventoryResponse } from './inventory.types.js';

type InventoryWithVendor = Inventory & {
  vendor: Vendor | null;
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDecimal(value: Decimal | null): string | null {
  return value === null ? null : value.toString();
}

export function toInventoryResponse(item: InventoryWithVendor): InventoryResponse {
  return {
    id: item.id.toString(),
    vendorId: item.vendorId?.toString() ?? null,
    title: item.title,
    description: item.description,
    category: item.category,
    quantity: formatDecimal(item.quantity),
    unit: item.unit,
    purchasePrice: formatDecimal(item.purchasePrice),
    purchaseDate: item.purchaseDate ? formatDate(item.purchaseDate) : null,
    deliveryDate: item.deliveryDate ? formatDate(item.deliveryDate) : null,
    inventoryType: item.inventoryType,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    vendor: item.vendor
      ? {
          id: item.vendor.id.toString(),
          vendorName: item.vendor.vendorName,
        }
      : null,
  };
}
