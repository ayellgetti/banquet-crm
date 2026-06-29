import type { PaymentMode, PaymentType } from '@prisma/client';
import type { PaginationMeta } from '../../shared/pagination.js';

export interface PaymentBookingSummary {
  id: string;
  bookingNumber: string | null;
}

export interface PaymentVendorSummary {
  id: string;
  vendorName: string;
}

export interface PaymentUserSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface PaymentResponse {
  id: string;
  bookingId: string | null;
  vendorId: string | null;
  paymentType: PaymentType;
  transactionType: string | null;
  transactionDate: string;
  paymentMode: PaymentMode | null;
  amount: string;
  description: string | null;
  receivedFrom: string | null;
  paidTo: string | null;
  createdBy: string | null;
  createdAt: string;
  booking: PaymentBookingSummary | null;
  vendor: PaymentVendorSummary | null;
  createdByUser: PaymentUserSummary | null;
}

export interface PaymentReportResult {
  items: PaymentResponse[];
  meta: PaginationMeta;
  totalAmount: string;
}
