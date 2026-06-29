import { EventStatus, LeadStatus, type PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toCalendarEventResponse, toEventResponse } from './event.mapper.js';
import { EventRepository } from './event.repository.js';
import type {
  CalendarQuery,
  CreateEventInput,
  ListEventsQuery,
  SaveMenuSelectionInput,
  UpdateEventInput,
} from './event.schema.js';
import { parseBigIntId } from './event.schema.js';
import type { CalendarEventResponse, EventResponse } from './event.types.js';

export class EventService {
  constructor(
    private readonly repository: EventRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListEventsQuery): Promise<PaginatedResult<EventResponse>> {
    const [events, total] = await this.repository.findAll(query);

    return {
      items: events.map(toEventResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getCalendar(query: CalendarQuery): Promise<CalendarEventResponse[]> {
    const events = await this.repository.findForCalendar(query);
    return events.map(toCalendarEventResponse);
  }

  async getById(id: bigint): Promise<EventResponse> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return toEventResponse(event);
  }

  async create(input: CreateEventInput): Promise<EventResponse> {
    const enquiryId = parseBigIntId(input.enquiryId);
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { event: true },
    });

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    if (enquiry.status === LeadStatus.LOST) {
      throw new AppError('Events cannot be created for lost enquiries', 400);
    }

    if (enquiry.event) {
      throw new AppError('An event already exists for this enquiry', 409);
    }

    const customerId = input.customerId
      ? parseBigIntId(input.customerId)
      : enquiry.customerId;

    if (customerId !== enquiry.customerId) {
      throw new AppError('Customer does not match enquiry', 400);
    }

    await this.ensureCustomerExists(customerId);

    const eventData = this.buildEventData(input, enquiryId, customerId);

    const event =
      enquiry.status === LeadStatus.CONVERTED
        ? await this.repository.create(eventData)
        : await this.repository.createWithEnquiryConversion(eventData, enquiryId);

    return toEventResponse(event);
  }

  async update(id: bigint, input: UpdateEventInput): Promise<EventResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    const event = await this.repository.update(id, {
      ...(input.eventType !== undefined && { eventType: input.eventType }),
      ...(input.eventDate !== undefined && { eventDate: new Date(input.eventDate) }),
      ...(input.timeSlot !== undefined && { timeSlot: input.timeSlot }),
      ...(input.guestCount !== undefined && { guestCount: input.guestCount }),
      ...(input.venue !== undefined && { venue: input.venue }),
      ...(input.menuPackage !== undefined && { menuPackage: input.menuPackage }),
      ...(input.platePackageId !== undefined && { platePackageId: input.platePackageId }),
      ...(input.approxBudget !== undefined && { approxBudget: input.approxBudget }),
      ...(input.decorationRequired !== undefined && {
        decorationRequired: input.decorationRequired,
      }),
      ...(input.referenceBy !== undefined && { referenceBy: input.referenceBy }),
      ...(input.specialRequirements !== undefined && {
        specialRequirements: input.specialRequirements,
      }),
      ...(input.status !== undefined && { status: input.status }),
    });

    return toEventResponse(event);
  }

  async saveMenuSelection(id: bigint, input: SaveMenuSelectionInput): Promise<EventResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    const event = await this.repository.update(id, {
      platePackageId: input.platePackageId,
      menuItemIds: input.menuItemIds,
      menuSavedAt: new Date(),
      ...(input.menuPackage !== undefined ? { menuPackage: input.menuPackage } : {}),
      ...(input.guestCount !== undefined && input.guestCount !== null
        ? { guestCount: input.guestCount }
        : {}),
    });

    return toEventResponse(event);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Event deleted' };
  }

  private buildEventData(
    input: CreateEventInput,
    enquiryId: bigint,
    customerId: bigint,
  ) {
    return {
      enquiryId,
      customerId,
      eventType: input.eventType,
      eventDate: new Date(input.eventDate),
      timeSlot: input.timeSlot,
      guestCount: input.guestCount,
      venue: input.venue,
      menuPackage: input.menuPackage,
      approxBudget: input.approxBudget,
      decorationRequired: input.decorationRequired ?? false,
      referenceBy: input.referenceBy,
      specialRequirements: input.specialRequirements,
      status: input.status ?? EventStatus.TENTATIVE,
    };
  }

  private async ensureCustomerExists(customerId: bigint): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
  }
}
