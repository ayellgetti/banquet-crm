import { BookingStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { ListBookingsQuery } from './booking.schema.js';

const bookingInclude = {
  event: { include: { customer: true } },
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.BookingOrderByWithRelationInput> = {
  bookingDate: 'bookingDate',
  bookingNumber: 'bookingNumber',
  totalAmount: 'totalAmount',
  finalAmount: 'finalAmount',
  status: 'status',
  createdAt: 'createdAt',
};

export class BookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListBookingsQuery) {
    const { page, limit, search, sortBy, order, status, eventId } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ search, status, eventId });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
  }

  findByEventId(eventId: bigint) {
    return this.prisma.booking.findUnique({
      where: { eventId },
    });
  }

  findLatestBookingNumberForYear(year: number) {
    const prefix = `BK-${year}-`;

    return this.prisma.booking.findFirst({
      where: {
        bookingNumber: { startsWith: prefix },
      },
      orderBy: { bookingNumber: 'desc' },
      select: { bookingNumber: true },
    });
  }

  create(data: Prisma.BookingUncheckedCreateInput) {
    return this.prisma.booking.create({
      data,
      include: bookingInclude,
    });
  }

  update(id: bigint, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: bookingInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.booking.delete({ where: { id } });
  }

  private buildWhere(filters: {
    search?: string;
    status?: BookingStatus;
    eventId?: string;
  }): Prisma.BookingWhereInput | undefined {
    const conditions: Prisma.BookingWhereInput[] = [];

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.eventId) {
      conditions.push({ eventId: BigInt(filters.eventId) });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { bookingNumber: { contains: term, mode: 'insensitive' } },
          { comments: { contains: term, mode: 'insensitive' } },
          {
            event: {
              OR: [
                { eventType: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.BookingOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
