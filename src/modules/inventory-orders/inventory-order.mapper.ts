import type {
  Event,
  Customer,
  InventoryOrder,
  InventoryOrderLine,
  Vendor,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { InventoryOrderResponse } from './inventory-order.types.js';

type InventoryOrderWithRelations = InventoryOrder & {
  vendor: Vendor;
  event:
    | (Event & {
        customer: Customer;
      })
    | null;
  lineItems: InventoryOrderLine[];
};

function formatDecimal(value: Decimal): string {
  return value.toString();
}

export function toInventoryOrderResponse(order: InventoryOrderWithRelations): InventoryOrderResponse {
  return {
    id: order.id.toString(),
    orderNumber: order.orderNumber,
    vendorId: order.vendorId.toString(),
    eventId: order.eventId?.toString() ?? null,
    deliveryAt: order.deliveryAt.toISOString(),
    notes: order.notes,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    vendor: {
      id: order.vendor.id.toString(),
      vendorName: order.vendor.vendorName,
    },
    event: order.event
      ? {
          id: order.event.id.toString(),
          eventType: order.event.eventType,
          eventDate: order.event.eventDate.toISOString().slice(0, 10),
          customer: {
            firstName: order.event.customer.firstName,
            lastName: order.event.customer.lastName,
          },
        }
      : null,
    lineItems: order.lineItems
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((line) => ({
        id: line.id.toString(),
        materialId: line.materialId,
        materialName: line.materialName,
        materialCategory: line.materialCategory,
        unit: line.unit,
        quantity: formatDecimal(line.quantity),
        sortOrder: line.sortOrder,
      })),
  };
}
