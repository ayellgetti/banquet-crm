import { EventStatus, LeadStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { CalendarQuery, ListEventsQuery } from './event.schema.js';

const eventInclude = {
  customer: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.EventOrderByWithRelationInput> = {
  eventDate: 'eventDate',
  eventType: 'eventType',
  status: 'status',
  venue: 'venue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export class EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListEventsQuery) {
    const { page, limit, search, sortBy, order, status, customerId, from, to } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ search, status, customerId, from, to });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        include: eventInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);
  }

  findForCalendar(query: CalendarQuery) {
    const where = this.buildWhere({
      from: query.from,
      to: query.to,
      status: query.status,
    });

    return this.prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy: [{ eventDate: 'asc' }, { timeSlot: 'asc' }],
    });
  }

  findById(id: bigint) {
    return this.prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
  }

  findByEnquiryId(enquiryId: bigint) {
    return this.prisma.event.findUnique({
      where: { enquiryId },
    });
  }

  createWithEnquiryConversion(
    eventData: Prisma.EventUncheckedCreateInput,
    enquiryId: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: eventData,
        include: eventInclude,
      });

      await tx.enquiry.update({
        where: { id: enquiryId },
        data: { status: LeadStatus.CONVERTED },
      });

      return event;
    });
  }

  create(eventData: Prisma.EventUncheckedCreateInput) {
    return this.prisma.event.create({
      data: eventData,
      include: eventInclude,
    });
  }

  update(id: bigint, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: { id },
      data,
      include: eventInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.event.delete({ where: { id } });
  }

  private buildWhere(filters: {
    search?: string;
    status?: EventStatus;
    customerId?: string;
    from?: string;
    to?: string;
  }): Prisma.EventWhereInput | undefined {
    const conditions: Prisma.EventWhereInput[] = [];

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.customerId) {
      conditions.push({ customerId: BigInt(filters.customerId) });
    }

    if (filters.from || filters.to) {
      conditions.push({
        eventDate: {
          ...(filters.from ? { gte: new Date(filters.from) } : {}),
          ...(filters.to ? { lte: new Date(filters.to) } : {}),
        },
      });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { eventType: { contains: term, mode: 'insensitive' } },
          { venue: { contains: term, mode: 'insensitive' } },
          { menuPackage: { contains: term, mode: 'insensitive' } },
          { referenceBy: { contains: term, mode: 'insensitive' } },
          {
            customer: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
                { mobileNo: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    if (conditions.length === 0) {
      return undefined;
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  private buildOrderBy(
    sortBy: string | undefined,
    order: 'asc' | 'desc',
  ): Prisma.EventOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { eventDate: 'desc' };
    }

    return { [field]: order };
  }
}
