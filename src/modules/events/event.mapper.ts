import type { Customer, Event } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { CustomerSummary } from '../enquiries/enquiry.types.js';
import type { CalendarEventResponse, EventResponse } from './event.types.js';

type EventWithCustomer = Event & {
  customer: Customer;
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDecimal(value: Decimal | null): string | null {
  return value === null ? null : value.toString();
}

function toCustomerSummary(customer: Customer): CustomerSummary {
  return {
    id: customer.id.toString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    mobileNo: customer.mobileNo,
  };
}

export function toEventResponse(event: EventWithCustomer): EventResponse {
  return {
    id: event.id.toString(),
    enquiryId: event.enquiryId.toString(),
    customerId: event.customerId.toString(),
    eventType: event.eventType,
    eventDate: formatDate(event.eventDate),
    timeSlot: event.timeSlot,
    guestCount: event.guestCount,
    venue: event.venue,
    menuPackage: event.menuPackage,
    platePackageId: event.platePackageId,
    menuItemIds: event.menuItemIds ?? [],
    menuSavedAt: event.menuSavedAt ? event.menuSavedAt.toISOString() : null,
    approxBudget: formatDecimal(event.approxBudget),
    decorationRequired: event.decorationRequired,
    referenceBy: event.referenceBy,
    specialRequirements: event.specialRequirements,
    status: event.status,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    customer: toCustomerSummary(event.customer),
  };
}

export function toCalendarEventResponse(event: EventWithCustomer): CalendarEventResponse {
  return {
    id: event.id.toString(),
    enquiryId: event.enquiryId.toString(),
    eventType: event.eventType,
    eventDate: formatDate(event.eventDate),
    timeSlot: event.timeSlot,
    status: event.status,
    venue: event.venue,
    guestCount: event.guestCount,
    customer: toCustomerSummary(event.customer),
  };
}
