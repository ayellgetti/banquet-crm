import type { Booking, Invoice, InvoiceLineItem, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  type InvoiceLineItemResponse,
  type InvoiceResponse,
  mapDiscountTypeFromDb,
} from './invoice.types.js';

type InvoiceWithRelations = Invoice & {
  lineItems: InvoiceLineItem[];
  booking: Booking | null;
  createdByUser: User | null;
};

function formatDecimal(value: Decimal): string {
  return value.toString();
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapLineItem(line: InvoiceLineItem): InvoiceLineItemResponse {
  return {
    id: line.id.toString(),
    description: line.description,
    quantity: formatDecimal(line.quantity),
    rate: formatDecimal(line.rate),
    amount: formatDecimal(line.amount),
    sortOrder: line.sortOrder,
  };
}

export function toInvoiceResponse(invoice: InvoiceWithRelations): InvoiceResponse {
  return {
    id: invoice.id.toString(),
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatDate(invoice.invoiceDate),
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : null,
    businessName: invoice.businessName,
    businessAddress: invoice.businessAddress,
    businessPhone: invoice.businessPhone,
    businessEmail: invoice.businessEmail,
    authorizedSignatory: invoice.authorizedSignatory,
    paymentInfo: invoice.paymentInfo,
    customerName: invoice.customerName,
    customerAddress: invoice.customerAddress,
    customerPhone: invoice.customerPhone,
    customerEmail: invoice.customerEmail,
    discountType: mapDiscountTypeFromDb(invoice.discountType),
    discountPercent: formatDecimal(invoice.discountPercent),
    discountAmount: formatDecimal(invoice.discountAmount),
    subtotal: formatDecimal(invoice.subtotal),
    totalAmount: formatDecimal(invoice.totalAmount),
    notes: invoice.notes,
    bookingId: invoice.bookingId?.toString() ?? null,
    createdBy: invoice.createdBy?.toString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    lineItems: invoice.lineItems
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapLineItem),
    booking: invoice.booking
      ? {
          id: invoice.booking.id.toString(),
          bookingNumber: invoice.booking.bookingNumber,
        }
      : null,
  };
}
