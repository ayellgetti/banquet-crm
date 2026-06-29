import type { Prisma, PrismaClient } from '@prisma/client';
import type { ListVendorsQuery } from './vendor.schema.js';

const vendorInclude = {
  category: true,
} as const;

const SORTABLE_FIELDS: Record<string, keyof Prisma.VendorOrderByWithRelationInput> = {
  vendorName: 'vendorName',
  createdAt: 'createdAt',
};

export class VendorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListVendorsQuery) {
    const { page, limit, search, sortBy, order, categoryId } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(search, categoryId);
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.vendor.findMany({
        where,
        include: vendorInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.vendor.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: vendorInclude,
    });
  }

  findAllCategories() {
    return this.prisma.vendorCategory.findMany({
      orderBy: { categoryName: 'asc' },
    });
  }

  create(data: Prisma.VendorUncheckedCreateInput) {
    return this.prisma.vendor.create({
      data,
      include: vendorInclude,
    });
  }

  update(id: bigint, data: Prisma.VendorUpdateInput) {
    return this.prisma.vendor.update({
      where: { id },
      data,
      include: vendorInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.vendor.delete({ where: { id } });
  }

  private buildWhere(search?: string, categoryId?: string): Prisma.VendorWhereInput | undefined {
    const conditions: Prisma.VendorWhereInput[] = [];

    if (categoryId) {
      conditions.push({ categoryId: BigInt(categoryId) });
    }

    if (search?.trim()) {
      const term = search.trim();

      conditions.push({
        OR: [
          { vendorName: { contains: term, mode: 'insensitive' } },
          { mobile: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { gstNumber: { contains: term, mode: 'insensitive' } },
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
  ): Prisma.VendorOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
