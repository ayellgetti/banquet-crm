import type { Prisma, PrismaClient } from '@prisma/client';
import type { ListInventoryOrdersQuery } from './inventory-order.schema.js';

const orderInclude = {
  vendor: true,
  event: {
    include: {
      customer: true,
    },
  },
  lineItems: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.InventoryOrderOrderByWithRelationInput> = {
  orderNumber: 'orderNumber',
  deliveryAt: 'deliveryAt',
  createdAt: 'createdAt',
  status: 'status',
};

export class InventoryOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListInventoryOrdersQuery) {
    const { page, limit, search, sortBy, order, vendorId, eventId, status } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ search, vendorId, eventId, status });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.inventoryOrder.findMany({
        where,
        include: orderInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.inventoryOrder.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.inventoryOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  }

  countCreatedOnDate(date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return this.prisma.inventoryOrder.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  create(data: Prisma.InventoryOrderUncheckedCreateInput) {
    return this.prisma.inventoryOrder.create({
      data,
      include: orderInclude,
    });
  }

  private buildWhere(filters: {
    search?: string;
    vendorId?: string;
    eventId?: string;
    status?: string;
  }): Prisma.InventoryOrderWhereInput | undefined {
    const conditions: Prisma.InventoryOrderWhereInput[] = [];

    if (filters.vendorId) {
      conditions.push({ vendorId: BigInt(filters.vendorId) });
    }

    if (filters.eventId) {
      conditions.push({ eventId: BigInt(filters.eventId) });
    }

    if (filters.status) {
      conditions.push({ status: filters.status as Prisma.EnumInventoryOrderStatusFilter['equals'] });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { orderNumber: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
          { vendor: { vendorName: { contains: term, mode: 'insensitive' } } },
          {
            lineItems: {
              some: { materialName: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.InventoryOrderOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
