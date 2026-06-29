import type { Prisma, PrismaClient, UserRole } from '@prisma/client';
import type { ListUsersQuery } from './user.schema.js';

const SORTABLE_FIELDS: Record<string, keyof Prisma.UserOrderByWithRelationInput> = {
  firstName: 'firstName',
  lastName: 'lastName',
  username: 'username',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListUsersQuery) {
    const { page, limit, search, sortBy, order } = query;
    const skip = (page - 1) * limit;
    const where = this.buildSearchWhere(search);
    const orderBy = this.buildOrderBy(sortBy, order);

    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  countByRole(role: UserRole) {
    return this.prisma.user.count({ where: { role } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  update(id: bigint, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: bigint) {
    return this.prisma.user.delete({ where: { id } });
  }

  private buildSearchWhere(search?: string): Prisma.UserWhereInput | undefined {
    if (!search?.trim()) {
      return undefined;
    }

    const term = search.trim();

    return {
      OR: [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { username: { contains: term, mode: 'insensitive' } },
        { mobileNo: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  private buildOrderBy(
    sortBy: string | undefined,
    order: 'asc' | 'desc',
  ): Prisma.UserOrderByWithRelationInput {
    const field = sortBy ? SORTABLE_FIELDS[sortBy] : undefined;

    if (!field) {
      return { createdAt: 'desc' };
    }

    return { [field]: order };
  }
}
