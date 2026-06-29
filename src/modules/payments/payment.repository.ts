import { PaymentMode, PaymentType, type Prisma, type PrismaClient } from '@prisma/client';
import type { ListPaymentsQuery, PaymentReportQuery } from './payment.schema.js';

const paymentInclude = {
  booking: true,
  vendor: true,
  createdByUser: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.PaymentOrderByWithRelationInput> = {
  transactionDate: 'transactionDate',
  amount: 'amount',
  paymentType: 'paymentType',
  createdAt: 'createdAt',
};

export class PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListPaymentsQuery) {
    const { page, limit, search, sortBy, order, ...filters } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ ...filters, search });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
  }

  findReport(paymentType: PaymentType, query: PaymentReportQuery) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ ...filters, paymentType });

    return this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });
  }

  create(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({
      data,
      include: paymentInclude,
    });
  }

  update(id: bigint, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
      include: paymentInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.payment.delete({ where: { id } });
  }

  private buildWhere(filters: {
    search?: string;
    paymentType?: PaymentType;
    bookingId?: string;
    vendorId?: string;
    paymentMode?: PaymentMode;
    from?: string;
    to?: string;
  }): Prisma.PaymentWhereInput | undefined {
    const conditions: Prisma.PaymentWhereInput[] = [];

    if (filters.paymentType) {
      conditions.push({ paymentType: filters.paymentType });
    }

    if (filters.bookingId) {
      conditions.push({ bookingId: BigInt(filters.bookingId) });
    }

    if (filters.vendorId) {
      conditions.push({ vendorId: BigInt(filters.vendorId) });
    }

    if (filters.paymentMode) {
      conditions.push({ paymentMode: filters.paymentMode });
    }

    if (filters.from || filters.to) {
      conditions.push({
        transactionDate: {
          ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
          ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
        },
      });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { description: { contains: term, mode: 'insensitive' } },
          { receivedFrom: { contains: term, mode: 'insensitive' } },
          { paidTo: { contains: term, mode: 'insensitive' } },
          { transactionType: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.PaymentOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { transactionDate: 'desc' };
    }

    return { [field]: order };
  }
}
