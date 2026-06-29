import type { Prisma, PrismaClient } from '@prisma/client';
import type { ListInvoicesQuery } from './invoice.schema.js';

const invoiceInclude = {
  lineItems: true,
  booking: true,
  createdByUser: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.InvoiceOrderByWithRelationInput> = {
  invoiceDate: 'invoiceDate',
  invoiceNumber: 'invoiceNumber',
  customerName: 'customerName',
  totalAmount: 'totalAmount',
  createdAt: 'createdAt',
};

export class InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListInvoicesQuery) {
    const { page, limit, search, sortBy, order, ...filters } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ ...filters, search });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: invoiceInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
  }

  findByInvoiceNumber(invoiceNumber: string) {
    return this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: invoiceInclude,
    });
  }

  create(data: Prisma.InvoiceUncheckedCreateInput) {
    return this.prisma.invoice.create({
      data,
      include: invoiceInclude,
    });
  }

  update(id: bigint, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: invoiceInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  private buildWhere(filters: {
    search?: string;
    bookingId?: string;
    from?: string;
    to?: string;
  }): Prisma.InvoiceWhereInput | undefined {
    const conditions: Prisma.InvoiceWhereInput[] = [];

    if (filters.bookingId) {
      conditions.push({ bookingId: BigInt(filters.bookingId) });
    }

    if (filters.from || filters.to) {
      conditions.push({
        invoiceDate: {
          ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
          ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
        },
      });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { invoiceNumber: { contains: term, mode: 'insensitive' } },
          { customerName: { contains: term, mode: 'insensitive' } },
          { customerPhone: { contains: term, mode: 'insensitive' } },
          { customerEmail: { contains: term, mode: 'insensitive' } },
          { businessName: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.InvoiceOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { invoiceDate: 'desc' };
    }

    return { [field]: order };
  }
}
