import { LeadStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { ListFollowupsQuery } from './followup.schema.js';

const followupInclude = {
  enquiry: { include: { customer: true } },
  event: true,
  followedByUser: true,
} as const;

const OPEN_ENQUIRY_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.FOLLOW_UP,
  LeadStatus.QUOTATION_SENT,
  LeadStatus.NEGOTIATION,
];

const SORTABLE_FIELDS: Record<string, keyof Prisma.FollowUpOrderByWithRelationInput> = {
  followupDate: 'followupDate',
  nextFollowupDate: 'nextFollowupDate',
  createdAt: 'createdAt',
};

export class FollowupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListFollowupsQuery) {
    const { page, limit, search, sortBy, order, enquiryId, eventId } = query;
    const skip = (page - 1) * limit;
    const where = this.buildListWhere({ search, enquiryId, eventId });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        include: followupInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.followUp.count({ where }),
    ]);
  }

  findToday(start: Date, end: Date) {
    return this.prisma.followUp.findMany({
      where: {
        nextFollowupDate: {
          gte: start,
          lte: end,
        },
      },
      include: followupInclude,
      orderBy: { nextFollowupDate: 'asc' },
    });
  }

  findPending(startOfToday: Date) {
    return this.prisma.followUp.findMany({
      where: {
        nextFollowupDate: { gte: startOfToday },
        enquiry: { status: { in: OPEN_ENQUIRY_STATUSES } },
      },
      include: followupInclude,
      orderBy: { nextFollowupDate: 'asc' },
    });
  }

  findOverdue(now: Date) {
    return this.prisma.followUp.findMany({
      where: {
        nextFollowupDate: { lt: now },
        enquiry: { status: { in: OPEN_ENQUIRY_STATUSES } },
      },
      include: followupInclude,
      orderBy: { nextFollowupDate: 'asc' },
    });
  }

  findById(id: bigint) {
    return this.prisma.followUp.findUnique({
      where: { id },
      include: followupInclude,
    });
  }

  create(data: Prisma.FollowUpUncheckedCreateInput) {
    return this.prisma.followUp.create({
      data,
      include: followupInclude,
    });
  }

  update(id: bigint, data: Prisma.FollowUpUpdateInput) {
    return this.prisma.followUp.update({
      where: { id },
      data,
      include: followupInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.followUp.delete({ where: { id } });
  }

  private buildListWhere(filters: {
    search?: string;
    enquiryId?: string;
    eventId?: string;
  }): Prisma.FollowUpWhereInput | undefined {
    const conditions: Prisma.FollowUpWhereInput[] = [];

    if (filters.enquiryId) {
      conditions.push({ enquiryId: BigInt(filters.enquiryId) });
    }

    if (filters.eventId) {
      conditions.push({ eventId: BigInt(filters.eventId) });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { comments: { contains: term, mode: 'insensitive' } },
          {
            enquiry: {
              OR: [
                { leadSource: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.FollowUpOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { nextFollowupDate: 'asc' };
    }

    return { [field]: order };
  }
}
