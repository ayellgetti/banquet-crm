import type { CustomerSummary } from '../enquiries/enquiry.types.js';
import type { EventStatus, TimeSlot } from '@prisma/client';

export interface EventResponse {
  id: string;
  enquiryId: string;
  customerId: string;
  eventType: string;
  eventDate: string;
  timeSlot: TimeSlot | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  platePackageId: string | null;
  menuItemIds: string[];
  menuSavedAt: string | null;
  approxBudget: string | null;
  decorationRequired: boolean;
  referenceBy: string | null;
  specialRequirements: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  customer: CustomerSummary;
}

export interface CalendarEventResponse {
  id: string;
  enquiryId: string;
  eventType: string;
  eventDate: string;
  timeSlot: TimeSlot | null;
  status: EventStatus;
  venue: string | null;
  guestCount: number | null;
  customer: CustomerSummary;
}
