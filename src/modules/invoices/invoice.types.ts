import type { InvoiceDiscountType } from '@prisma/client';

export type InvoiceLineItemResponse = {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  sortOrder: number;
};

export type InvoiceResponse = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  businessName: string;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  authorizedSignatory: string | null;
  paymentInfo: string | null;
  customerName: string;
  customerAddress: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  discountType: 'percent' | 'fixed';
  discountPercent: string;
  discountAmount: string;
  subtotal: string;
  totalAmount: string;
  notes: string | null;
  bookingId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: InvoiceLineItemResponse[];
  booking: { id: string; bookingNumber: string | null } | null;
};

export function mapDiscountTypeFromDb(type: InvoiceDiscountType): 'percent' | 'fixed' {
  return type === 'FIXED' ? 'fixed' : 'percent';
}
