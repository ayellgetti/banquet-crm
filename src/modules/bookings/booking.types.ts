import type { BookingStatus } from '@prisma/client';
import type { CustomerSummary } from '../enquiries/enquiry.types.js';

export interface BookingEventSummary {
  id: string;
  eventType: string;
  eventDate: string;
  customer: CustomerSummary;
}

export interface BookingResponse {
  id: string;
  eventId: string;
  bookingNumber: string | null;
  bookingDate: string;
  totalAmount: string;
  advanceAmount: string;
  discount: string;
  finalAmount: string;
  status: BookingStatus;
  comments: string | null;
  createdAt: string;
  event: BookingEventSummary;
}
