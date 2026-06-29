import { EventStatus, LeadStatus, type PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import type { CreateLeadInput, LeadResponse } from './lead.schema.js';

export class LeadService {
  constructor(private readonly prisma: PrismaClient) {}

  async createLead(input: CreateLeadInput): Promise<LeadResponse> {
    const result = await this.prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: {
          OR: [{ mobileNo: input.mobileNo }, { alternateMobileNo: input.mobileNo }],
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            mobileNo: input.mobileNo,
          },
        });
      }

      const enquiry = await tx.enquiry.create({
        data: {
          customerId: customer.id,
          enquiryDate: new Date(input.eventDate),
          leadSource: input.leadSource,
          status: LeadStatus.NEW,
          remarks: input.remarks,
        },
      });

      const event = await tx.event.create({
        data: {
          enquiryId: enquiry.id,
          customerId: customer.id,
          eventType: input.eventType,
          eventDate: new Date(input.eventDate),
          timeSlot: input.timeSlot,
          guestCount: input.guestCount,
          venue: input.venue,
          menuPackage: input.menuPackage,
          approxBudget: input.approxBudget,
          decorationRequired: input.decorationRequired ?? false,
          specialRequirements: input.specialRequirements,
          status: EventStatus.TENTATIVE,
        },
      });

      return {
        customerId: customer.id,
        enquiryId: enquiry.id,
        eventId: event.id,
        status: event.status,
      };
    });

    return {
      customerId: result.customerId.toString(),
      enquiryId: result.enquiryId.toString(),
      eventId: result.eventId.toString(),
      status: result.status,
    };
  }
}

export function assertLeadApiKey(headerValue: string | undefined): void {
  const configuredKey = process.env.LEAD_API_KEY?.trim();

  if (!configuredKey) {
    return;
  }

  if (!headerValue || headerValue !== configuredKey) {
    throw new AppError('Invalid lead API key', 401);
  }
}
