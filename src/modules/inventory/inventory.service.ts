import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toInventoryResponse } from './inventory.mapper.js';
import { InventoryRepository } from './inventory.repository.js';
import type {
  CreateInventoryInput,
  ListInventoryQuery,
  UpdateInventoryInput,
} from './inventory.schema.js';
import { parseOptionalBigInt } from './inventory.schema.js';
import type { InventoryResponse } from './inventory.types.js';

export class InventoryService {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListInventoryQuery): Promise<PaginatedResult<InventoryResponse>> {
    const [items, total] = await this.repository.findAll(query);

    return {
      items: items.map(toInventoryResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<InventoryResponse> {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    return toInventoryResponse(item);
  }

  async create(input: CreateInventoryInput): Promise<InventoryResponse> {
    const vendorId = parseOptionalBigInt(input.vendorId);

    if (vendorId) {
      await this.ensureVendorExists(vendorId);
    }

    const item = await this.repository.create({
      vendorId,
      title: input.title,
      description: input.description,
      category: input.category,
      quantity: input.quantity,
      unit: input.unit,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      inventoryType: input.inventoryType,
      status: input.status,
    });

    return toInventoryResponse(item);
  }

  async update(id: bigint, input: UpdateInventoryInput): Promise<InventoryResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Inventory item not found', 404);
    }

    const vendorId = parseOptionalBigInt(input.vendorId);

    if (vendorId) {
      await this.ensureVendorExists(vendorId);
    }

    const item = await this.repository.update(id, {
      ...(input.vendorId !== undefined && { vendorId }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.unit !== undefined && { unit: input.unit }),
      ...(input.purchasePrice !== undefined && { purchasePrice: input.purchasePrice }),
      ...(input.purchaseDate !== undefined && {
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      }),
      ...(input.deliveryDate !== undefined && {
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      }),
      ...(input.inventoryType !== undefined && { inventoryType: input.inventoryType }),
      ...(input.status !== undefined && { status: input.status }),
    });

    return toInventoryResponse(item);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Inventory item deleted' };
  }

  private async ensureVendorExists(vendorId: bigint): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
  }
}
