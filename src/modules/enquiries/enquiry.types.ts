import type { EventStatus, LeadStatus, TimeSlot } from '@prisma/client';

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface EnquiryResponse {
  id: string;
  customerId: string;
  enquiryDate: string;
  leadSource: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  customer: CustomerSummary;
  assignedUser: UserSummary | null;
  eventId: string | null;
}

export interface ConvertedEventResponse {
  id: string;
  enquiryId: string;
  customerId: string;
  eventType: string;
  eventDate: string;
  timeSlot: TimeSlot | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  approxBudget: string | null;
  decorationRequired: boolean;
  referenceBy: string | null;
  specialRequirements: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConvertEnquiryResult {
  enquiry: EnquiryResponse;
  event: ConvertedEventResponse;
}
