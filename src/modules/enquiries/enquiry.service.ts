import { EventStatus, LeadStatus, type PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toConvertedEventResponse, toEnquiryResponse } from './enquiry.mapper.js';
import { EnquiryRepository } from './enquiry.repository.js';
import type {
  ConvertEnquiryInput,
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from './enquiry.schema.js';
import { parseOptionalBigInt, parseRequiredBigInt } from './enquiry.schema.js';
import type { ConvertEnquiryResult, EnquiryResponse } from './enquiry.types.js';

export class EnquiryService {
  constructor(
    private readonly repository: EnquiryRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListEnquiriesQuery): Promise<PaginatedResult<EnquiryResponse>> {
    const [enquiries, total] = await this.repository.findAll(query);

    return {
      items: enquiries.map(toEnquiryResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<EnquiryResponse> {
    const enquiry = await this.repository.findById(id);

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    return toEnquiryResponse(enquiry);
  }

  async create(input: CreateEnquiryInput): Promise<EnquiryResponse> {
    const customerId = parseRequiredBigInt(input.customerId);
    await this.ensureCustomerExists(customerId);

    const assignedTo = parseOptionalBigInt(input.assignedTo);
    if (assignedTo) {
      await this.ensureUserExists(assignedTo);
    }

    const enquiry = await this.repository.create({
      customer: { connect: { id: customerId } },
      enquiryDate: input.enquiryDate ? new Date(input.enquiryDate) : undefined,
      leadSource: input.leadSource,
      status: input.status,
      ...(assignedTo ? { assignedUser: { connect: { id: assignedTo } } } : {}),
      remarks: input.remarks,
    });

    return toEnquiryResponse(enquiry);
  }

  async update(id: bigint, input: UpdateEnquiryInput): Promise<EnquiryResponse> {
    const existing = await this.repository.findByIdWithEvent(id);

    if (!existing) {
      throw new AppError('Enquiry not found', 404);
    }

    if (existing.status === LeadStatus.CONVERTED) {
      throw new AppError('Converted enquiries cannot be updated', 400);
    }

    if (input.customerId) {
      await this.ensureCustomerExists(parseRequiredBigInt(input.customerId));
    }

    const assignedTo = parseOptionalBigInt(input.assignedTo);
    if (assignedTo) {
      await this.ensureUserExists(assignedTo);
    }

    const enquiry = await this.repository.update(id, {
      ...(input.customerId !== undefined && {
        customer: { connect: { id: parseRequiredBigInt(input.customerId) } },
      }),
      ...(input.enquiryDate !== undefined && { enquiryDate: new Date(input.enquiryDate) }),
      ...(input.leadSource !== undefined && { leadSource: input.leadSource }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.assignedTo !== undefined && {
        assignedUser:
          assignedTo === null
            ? { disconnect: true }
            : { connect: { id: assignedTo as bigint } },
      }),
      ...(input.remarks !== undefined && { remarks: input.remarks }),
    });

    return toEnquiryResponse(enquiry);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const enquiry = await this.repository.findById(id);

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Enquiry deleted' };
  }

  async convert(id: bigint, input: ConvertEnquiryInput): Promise<ConvertEnquiryResult> {
    const enquiry = await this.repository.findByIdWithEvent(id);

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    if (enquiry.status === LeadStatus.CONVERTED) {
      throw new AppError('Enquiry is already converted', 409);
    }

    if (enquiry.status === LeadStatus.LOST) {
      throw new AppError('Lost enquiries cannot be converted', 400);
    }

    if (enquiry.event) {
      const existingBooking = await this.prisma.booking.findUnique({
        where: { eventId: enquiry.event.id },
      });

      if (existingBooking) {
        throw new AppError('A booking already exists for this enquiry', 409);
      }

      const event = await this.prisma.event.update({
        where: { id: enquiry.event.id },
        data: {
          eventType: input.eventType,
          eventDate: new Date(input.eventDate),
          timeSlot: input.timeSlot,
          guestCount: input.guestCount,
          venue: input.venue,
          menuPackage: input.menuPackage,
          platePackageId: input.platePackageId,
          approxBudget: input.approxBudget,
          decorationRequired: input.decorationRequired ?? enquiry.event.decorationRequired,
          referenceBy: input.referenceBy,
          specialRequirements: input.specialRequirements,
          status: input.status ?? EventStatus.TENTATIVE,
        },
      });

      const updatedEnquiry = await this.repository.update(id, {
        status: LeadStatus.CONVERTED,
      });

      return {
        enquiry: toEnquiryResponse({ ...updatedEnquiry, event: { id: event.id } }),
        event: toConvertedEventResponse(event),
      };
    }

    const { enquiry: updatedEnquiry, event } = await this.repository.convert(id, {
      enquiryId: id,
      customerId: enquiry.customerId,
      eventType: input.eventType,
      eventDate: new Date(input.eventDate),
      timeSlot: input.timeSlot,
      guestCount: input.guestCount,
      venue: input.venue,
      menuPackage: input.menuPackage,
      platePackageId: input.platePackageId,
      approxBudget: input.approxBudget,
      decorationRequired: input.decorationRequired ?? false,
      referenceBy: input.referenceBy,
      specialRequirements: input.specialRequirements,
      status: input.status ?? EventStatus.TENTATIVE,
    });

    return {
      enquiry: toEnquiryResponse(updatedEnquiry),
      event: toConvertedEventResponse(event),
    };
  }

  private async ensureCustomerExists(customerId: bigint): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
  }

  private async ensureUserExists(userId: bigint): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Assigned user not found', 404);
    }
  }
}
