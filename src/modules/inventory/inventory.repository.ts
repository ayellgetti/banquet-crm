import { InventoryStatus, InventoryType, type Prisma, type PrismaClient } from '@prisma/client';
import type { ListInventoryQuery } from './inventory.schema.js';

const inventoryInclude = {
  vendor: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.InventoryOrderByWithRelationInput> = {
  title: 'title',
  category: 'category',
  status: 'status',
  inventoryType: 'inventoryType',
  createdAt: 'createdAt',
};

export class InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListInventoryQuery) {
    const { page, limit, search, sortBy, order, status, inventoryType, vendorId } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ search, status, inventoryType, vendorId });
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.inventory.findMany({
        where,
        include: inventoryInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.inventory.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: inventoryInclude,
    });
  }

  create(data: Prisma.InventoryUncheckedCreateInput) {
    return this.prisma.inventory.create({
      data,
      include: inventoryInclude,
    });
  }

  update(id: bigint, data: Prisma.InventoryUpdateInput) {
    return this.prisma.inventory.update({
      where: { id },
      data,
      include: inventoryInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.inventory.delete({ where: { id } });
  }

  private buildWhere(filters: {
    search?: string;
    status?: InventoryStatus;
    inventoryType?: InventoryType;
    vendorId?: string;
  }): Prisma.InventoryWhereInput | undefined {
    const conditions: Prisma.InventoryWhereInput[] = [];

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.inventoryType) {
      conditions.push({ inventoryType: filters.inventoryType });
    }

    if (filters.vendorId) {
      conditions.push({ vendorId: BigInt(filters.vendorId) });
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();

      conditions.push({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { unit: { contains: term, mode: 'insensitive' } },
          {
            vendor: {
              vendorName: { contains: term, mode: 'insensitive' },
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
  ): Prisma.InventoryOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
