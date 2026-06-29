import type { Booking, Customer, Event } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { CustomerSummary } from '../enquiries/enquiry.types.js';
import type { BookingResponse } from './booking.types.js';

type BookingWithEvent = Booking & {
  event: Event & { customer: Customer };
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDecimal(value: Decimal): string {
  return value.toString();
}

function toCustomerSummary(customer: Customer): CustomerSummary {
  return {
    id: customer.id.toString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    mobileNo: customer.mobileNo,
  };
}

export function toBookingResponse(booking: BookingWithEvent): BookingResponse {
  return {
    id: booking.id.toString(),
    eventId: booking.eventId.toString(),
    bookingNumber: booking.bookingNumber,
    bookingDate: formatDate(booking.bookingDate),
    totalAmount: formatDecimal(booking.totalAmount),
    advanceAmount: formatDecimal(booking.advanceAmount),
    discount: formatDecimal(booking.discount),
    finalAmount: formatDecimal(booking.finalAmount),
    status: booking.status,
    comments: booking.comments,
    createdAt: booking.createdAt.toISOString(),
    event: {
      id: booking.event.id.toString(),
      eventType: booking.event.eventType,
      eventDate: formatDate(booking.event.eventDate),
      customer: toCustomerSummary(booking.event.customer),
    },
  };
}
