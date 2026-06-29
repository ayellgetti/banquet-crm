import { LeadStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { ListEnquiriesQuery } from './enquiry.schema.js';

const enquiryInclude = {
  customer: true,
  assignedUser: true,
  event: { select: { id: true } },
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.EnquiryOrderByWithRelationInput> = {
  enquiryDate: 'enquiryDate',
  status: 'status',
  leadSource: 'leadSource',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export class EnquiryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListEnquiriesQuery) {
    const { page, limit, search, sortBy, order, status, customerId } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(search, status, customerId);
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.enquiry.findMany({
        where,
        include: enquiryInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.enquiry.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.enquiry.findUnique({
      where: { id },
      include: enquiryInclude,
    });
  }

  findByIdWithEvent(id: bigint) {
    return this.prisma.enquiry.findUnique({
      where: { id },
      include: {
        ...enquiryInclude,
        event: true,
      },
    });
  }

  create(data: Prisma.EnquiryCreateInput) {
    return this.prisma.enquiry.create({
      data,
      include: enquiryInclude,
    });
  }

  update(id: bigint, data: Prisma.EnquiryUpdateInput) {
    return this.prisma.enquiry.update({
      where: { id },
      data,
      include: enquiryInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.enquiry.delete({ where: { id } });
  }

  convert(
    enquiryId: bigint,
    eventData: Prisma.EventUncheckedCreateInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({ data: eventData });

      const enquiry = await tx.enquiry.update({
        where: { id: enquiryId },
        data: { status: LeadStatus.CONVERTED },
        include: enquiryInclude,
      });

      return { enquiry, event };
    });
  }

  private buildWhere(
    search?: string,
    status?: LeadStatus,
    customerId?: string,
  ): Prisma.EnquiryWhereInput | undefined {
    const conditions: Prisma.EnquiryWhereInput[] = [];

    if (status) {
      conditions.push({ status });
    }

    if (customerId) {
      conditions.push({ customerId: BigInt(customerId) });
    }

    if (search?.trim()) {
      const term = search.trim();

      conditions.push({
        OR: [
          { leadSource: { contains: term, mode: 'insensitive' } },
          { remarks: { contains: term, mode: 'insensitive' } },
          { status: { equals: term.toUpperCase() as LeadStatus } },
          {
            customer: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
                { mobileNo: { contains: term, mode: 'insensitive' } },
                { emailId: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.EnquiryOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
