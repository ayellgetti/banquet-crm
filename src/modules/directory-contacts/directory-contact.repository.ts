import type { DirectoryContact, DirectoryContactType, Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { ListDirectoryContactsQuery } from './directory-contact.schema.js';

export type DirectoryContactResponse = {
  id: string;
  type: DirectoryContactType;
  name: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toDirectoryContactResponse(contact: DirectoryContact): DirectoryContactResponse {
  return {
    id: contact.id.toString(),
    type: contact.type,
    name: contact.name,
    mobile: contact.mobile,
    email: contact.email,
    address: contact.address,
    notes: contact.notes,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export class DirectoryContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(query: ListDirectoryContactsQuery) {
    const { page, limit, search, sortBy, order, type } = query;
    const where = this.buildWhere(search, type);

    const [items, total] = await Promise.all([
      this.prisma.directoryContact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, order),
      }),
      this.prisma.directoryContact.count({ where }),
    ]);

    return [items, total] as const;
  }

  async create(data: Prisma.DirectoryContactCreateInput) {
    return this.prisma.directoryContact.create({ data });
  }

  private buildWhere(search?: string, type?: DirectoryContactType): Prisma.DirectoryContactWhereInput | undefined {
    const conditions: Prisma.DirectoryContactWhereInput[] = [];

    if (type) conditions.push({ type });

    if (search?.trim()) {
      const term = search.trim();
      conditions.push({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { mobile: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (!conditions.length) return undefined;
    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  private buildOrderBy(
    sortBy?: string,
    order: 'asc' | 'desc' = 'desc',
  ): Prisma.DirectoryContactOrderByWithRelationInput {
    if (sortBy === 'name') return { name: order };
    if (sortBy === 'type') return { type: order };
    return { createdAt: order };
  }
}
