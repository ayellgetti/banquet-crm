import type { InventoryStatus, InventoryType } from '@prisma/client';

export interface InventoryVendorSummary {
  id: string;
  vendorName: string;
}

export interface InventoryResponse {
  id: string;
  vendorId: string | null;
  title: string;
  description: string | null;
  category: string | null;
  quantity: string | null;
  unit: string | null;
  purchasePrice: string | null;
  purchaseDate: string | null;
  deliveryDate: string | null;
  inventoryType: InventoryType;
  status: InventoryStatus;
  createdAt: string;
  vendor: InventoryVendorSummary | null;
}
