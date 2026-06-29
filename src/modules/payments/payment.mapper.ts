import type { Booking, Payment, User, Vendor } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { PaymentResponse } from './payment.types.js';

type PaymentWithRelations = Payment & {
  booking: Booking | null;
  vendor: Vendor | null;
  createdByUser: User | null;
};

function formatDecimal(value: Decimal): string {
  return value.toString();
}

export function toPaymentResponse(payment: PaymentWithRelations): PaymentResponse {
  return {
    id: payment.id.toString(),
    bookingId: payment.bookingId?.toString() ?? null,
    vendorId: payment.vendorId?.toString() ?? null,
    paymentType: payment.paymentType,
    transactionType: payment.transactionType,
    transactionDate: payment.transactionDate.toISOString(),
    paymentMode: payment.paymentMode,
    amount: formatDecimal(payment.amount),
    description: payment.description,
    receivedFrom: payment.receivedFrom,
    paidTo: payment.paidTo,
    createdBy: payment.createdBy?.toString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    booking: payment.booking
      ? {
          id: payment.booking.id.toString(),
          bookingNumber: payment.booking.bookingNumber,
        }
      : null,
    vendor: payment.vendor
      ? {
          id: payment.vendor.id.toString(),
          vendorName: payment.vendor.vendorName,
        }
      : null,
    createdByUser: payment.createdByUser
      ? {
          id: payment.createdByUser.id.toString(),
          firstName: payment.createdByUser.firstName,
          lastName: payment.createdByUser.lastName,
        }
      : null,
  };
}

export function sumDecimalAmounts(amounts: Decimal[]): string {
  const total = amounts.reduce((sum, amount) => sum + Number(amount.toString()), 0);
  return total.toFixed(2);
}
