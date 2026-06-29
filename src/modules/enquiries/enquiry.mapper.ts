import type { Customer, Enquiry, Event, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  ConvertedEventResponse,
  CustomerSummary,
  EnquiryResponse,
  UserSummary,
} from './enquiry.types.js';

type EnquiryWithRelations = Enquiry & {
  customer: Customer;
  assignedUser: User | null;
  event: Pick<Event, 'id'> | null;
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

function toUserSummary(user: User): UserSummary {
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
  };
}

export function toEnquiryResponse(enquiry: EnquiryWithRelations): EnquiryResponse {
  return {
    id: enquiry.id.toString(),
    customerId: enquiry.customerId.toString(),
    enquiryDate: formatDate(enquiry.enquiryDate),
    leadSource: enquiry.leadSource,
    status: enquiry.status,
    assignedTo: enquiry.assignedTo?.toString() ?? null,
    remarks: enquiry.remarks,
    createdAt: enquiry.createdAt.toISOString(),
    updatedAt: enquiry.updatedAt.toISOString(),
    customer: toCustomerSummary(enquiry.customer),
    assignedUser: enquiry.assignedUser ? toUserSummary(enquiry.assignedUser) : null,
    eventId: enquiry.event?.id.toString() ?? null,
  };
}

export function toConvertedEventResponse(event: Event): ConvertedEventResponse {
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
    approxBudget: formatDecimal(event.approxBudget),
    decorationRequired: event.decorationRequired,
    referenceBy: event.referenceBy,
    specialRequirements: event.specialRequirements,
    status: event.status,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
