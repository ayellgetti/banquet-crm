import type { Prisma, PrismaClient } from '@prisma/client';
import type { ListCustomersQuery } from './customer.schema.js';

const SORTABLE_FIELDS: Record<string, keyof Prisma.CustomerOrderByWithRelationInput> = {
  firstName: 'firstName',
  lastName: 'lastName',
  mobileNo: 'mobileNo',
  city: 'city',
  state: 'state',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListCustomersQuery) {
    const { page, limit, search, sortBy, order, mobile } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(search, mobile);
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  findByMobileNo(mobileNo: string) {
    return this.prisma.customer.findFirst({
      where: {
        OR: [{ mobileNo }, { alternateMobileNo: mobileNo }],
      },
    });
  }

  create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data });
  }

  update(id: bigint, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  delete(id: bigint) {
    return this.prisma.customer.delete({ where: { id } });
  }

  private buildWhere(search?: string, mobile?: string): Prisma.CustomerWhereInput | undefined {
    const conditions: Prisma.CustomerWhereInput[] = [];

    if (search?.trim()) {
      const term = search.trim();

      conditions.push({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { mobileNo: { contains: term, mode: 'insensitive' } },
          { alternateMobileNo: { contains: term, mode: 'insensitive' } },
          { emailId: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
          { state: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (mobile) {
      conditions.push({
        OR: [
          { mobileNo: { contains: mobile, mode: 'insensitive' } },
          { alternateMobileNo: { contains: mobile, mode: 'insensitive' } },
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
  ): Prisma.CustomerOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
