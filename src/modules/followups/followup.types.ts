import type { CommunicationType, LeadStatus } from '@prisma/client';
import type { CustomerSummary, UserSummary } from '../enquiries/enquiry.types.js';

export interface FollowupEnquirySummary {
  id: string;
  status: LeadStatus;
  customer: CustomerSummary;
}

export interface FollowupEventSummary {
  id: string;
  eventType: string;
  eventDate: string;
}

export interface FollowupResponse {
  id: string;
  enquiryId: string;
  eventId: string | null;
  followupDate: string;
  nextFollowupDate: string | null;
  communicationType: CommunicationType | null;
  comments: string | null;
  followedBy: string | null;
  createdAt: string;
  enquiry: FollowupEnquirySummary;
  event: FollowupEventSummary | null;
  followedByUser: UserSummary | null;
}
