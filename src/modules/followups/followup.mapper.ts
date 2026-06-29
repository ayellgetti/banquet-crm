import type { Customer, Enquiry, Event, FollowUp, User } from '@prisma/client';
import type { CustomerSummary, UserSummary } from '../enquiries/enquiry.types.js';
import type { FollowupResponse } from './followup.types.js';

type FollowupWithRelations = FollowUp & {
  enquiry: Enquiry & { customer: Customer };
  event: Event | null;
  followedByUser: User | null;
};

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

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toFollowupResponse(followup: FollowupWithRelations): FollowupResponse {
  return {
    id: followup.id.toString(),
    enquiryId: followup.enquiryId.toString(),
    eventId: followup.eventId?.toString() ?? null,
    followupDate: followup.followupDate.toISOString(),
    nextFollowupDate: followup.nextFollowupDate?.toISOString() ?? null,
    communicationType: followup.communicationType,
    comments: followup.comments,
    followedBy: followup.followedBy?.toString() ?? null,
    createdAt: followup.createdAt.toISOString(),
    enquiry: {
      id: followup.enquiry.id.toString(),
      status: followup.enquiry.status,
      customer: toCustomerSummary(followup.enquiry.customer),
    },
    event: followup.event
      ? {
          id: followup.event.id.toString(),
          eventType: followup.event.eventType,
          eventDate: formatDate(followup.event.eventDate),
        }
      : null,
    followedByUser: followup.followedByUser ? toUserSummary(followup.followedByUser) : null,
  };
}
