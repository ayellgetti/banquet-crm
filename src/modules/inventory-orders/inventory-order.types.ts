export type InventoryOrderLineResponse = {
  id: string;
  materialId: string;
  materialName: string;
  materialCategory: string | null;
  unit: string;
  quantity: string;
  sortOrder: number;
};

export type InventoryOrderResponse = {
  id: string;
  orderNumber: string;
  vendorId: string;
  eventId: string | null;
  deliveryAt: string;
  notes: string | null;
  status: 'PLACED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  vendor: {
    id: string;
    vendorName: string;
  };
  event: {
    id: string;
    eventType: string;
    eventDate: string;
    customer: {
      firstName: string;
      lastName: string;
    };
  } | null;
  lineItems: InventoryOrderLineResponse[];
};
