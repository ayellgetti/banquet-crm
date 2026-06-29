import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toInventoryOrderResponse } from './inventory-order.mapper.js';
import { InventoryOrderRepository } from './inventory-order.repository.js';
import {
  type CreateInventoryOrderInput,
  type ListInventoryOrdersQuery,
  parseBigIntId,
  parseOptionalBigInt,
} from './inventory-order.schema.js';
import type { InventoryOrderResponse } from './inventory-order.types.js';

export class InventoryOrderService {
  constructor(
    private readonly repository: InventoryOrderRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListInventoryOrdersQuery): Promise<PaginatedResult<InventoryOrderResponse>> {
    const [orders, total] = await this.repository.findAll(query);

    return {
      items: orders.map(toInventoryOrderResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<InventoryOrderResponse> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new AppError('Inventory order not found', 404);
    }

    return toInventoryOrderResponse(order);
  }

  async create(input: CreateInventoryOrderInput, createdById?: string): Promise<InventoryOrderResponse> {
    const vendorId = parseBigIntId(input.vendorId);
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    const eventId = parseOptionalBigInt(input.eventId);
    if (eventId) {
      const event = await this.prisma.event.findUnique({ where: { id: eventId } });

      if (!event) {
        throw new AppError('Event not found', 404);
      }
    }

    const orderNumber = await this.generateOrderNumber();
    const deliveryAt = new Date(input.deliveryAt);

    const order = await this.repository.create({
      orderNumber,
      vendorId,
      eventId: eventId ?? null,
      deliveryAt,
      notes: input.notes,
      createdBy: createdById ? parseBigIntId(createdById) : undefined,
      lineItems: {
        create: input.lineItems.map((item, index) => ({
          materialId: item.materialId,
          materialName: item.materialName,
          materialCategory: item.materialCategory,
          unit: item.unit,
          quantity: item.quantity,
          sortOrder: index,
        })),
      },
    });

    return toInventoryOrderResponse(order);
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.repository.countCreatedOnDate(today);
    const sequence = String(count + 1).padStart(3, '0');

    return `INV-ORD-${datePart}-${sequence}`;
  }
}
