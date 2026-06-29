import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toInvoiceResponse } from './invoice.mapper.js';
import { InvoiceRepository } from './invoice.repository.js';
import {
  calcInvoiceAmounts,
  mapDiscountType,
  type CreateInvoiceInput,
  type ListInvoicesQuery,
  type UpdateInvoiceInput,
  parseBigIntId,
  parseOptionalBigInt,
} from './invoice.schema.js';
import type { InvoiceResponse } from './invoice.types.js';

export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListInvoicesQuery): Promise<PaginatedResult<InvoiceResponse>> {
    const [invoices, total] = await this.repository.findAll(query);

    return {
      items: invoices.map(toInvoiceResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<InvoiceResponse> {
    const invoice = await this.repository.findById(id);

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return toInvoiceResponse(invoice);
  }

  async create(input: CreateInvoiceInput, createdById?: string): Promise<InvoiceResponse> {
    const existing = await this.repository.findByInvoiceNumber(input.invoiceNumber);

    if (existing) {
      throw new AppError('Invoice number already exists', 409);
    }

    const bookingId = parseOptionalBigInt(input.bookingId);
    await this.validateBooking(bookingId);

    const amounts = calcInvoiceAmounts({
      lineItems: input.lineItems,
      discountType: input.discountType,
      discountPercent: input.discountPercent ?? 0,
      discountAmount: input.discountAmount ?? 0,
    });

    const invoice = await this.repository.create({
      invoiceNumber: input.invoiceNumber,
      invoiceDate: new Date(`${input.invoiceDate}T00:00:00.000Z`),
      dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null,
      businessName: input.businessName,
      businessAddress: input.businessAddress,
      businessPhone: input.businessPhone,
      businessEmail: input.businessEmail,
      authorizedSignatory: input.authorizedSignatory,
      paymentInfo: input.paymentInfo,
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      discountType: mapDiscountType(input.discountType),
      discountPercent: input.discountPercent ?? 0,
      discountAmount: amounts.discount,
      subtotal: amounts.subtotal,
      totalAmount: amounts.totalAmount,
      notes: input.notes,
      bookingId,
      createdBy: createdById ? parseBigIntId(createdById) : undefined,
      lineItems: {
        create: input.lineItems.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          sortOrder: index,
        })),
      },
    });

    return toInvoiceResponse(invoice);
  }

  async update(id: bigint, input: UpdateInvoiceInput): Promise<InvoiceResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Invoice not found', 404);
    }

    if (input.invoiceNumber && input.invoiceNumber !== existing.invoiceNumber) {
      const duplicate = await this.repository.findByInvoiceNumber(input.invoiceNumber);

      if (duplicate && duplicate.id !== id) {
        throw new AppError('Invoice number already exists', 409);
      }
    }

    const bookingId =
      input.bookingId !== undefined ? parseOptionalBigInt(input.bookingId) : existing.bookingId;
    await this.validateBooking(bookingId ?? undefined);

    const lineItems =
      input.lineItems ??
      existing.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity.toString()),
        rate: Number(item.rate.toString()),
      }));

    const discountType = input.discountType ?? (existing.discountType === 'FIXED' ? 'fixed' : 'percent');
    const discountPercent =
      input.discountPercent ??
      Number(existing.discountPercent.toString());
    const discountAmount =
      input.discountAmount ??
      Number(existing.discountAmount.toString());

    const amounts = calcInvoiceAmounts({
      lineItems,
      discountType,
      discountPercent,
      discountAmount,
    });

    const invoice = await this.repository.update(id, {
      ...(input.invoiceNumber !== undefined && { invoiceNumber: input.invoiceNumber }),
      ...(input.invoiceDate !== undefined && {
        invoiceDate: new Date(`${input.invoiceDate}T00:00:00.000Z`),
      }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null,
      }),
      ...(input.businessName !== undefined && { businessName: input.businessName }),
      ...(input.businessAddress !== undefined && { businessAddress: input.businessAddress }),
      ...(input.businessPhone !== undefined && { businessPhone: input.businessPhone }),
      ...(input.businessEmail !== undefined && { businessEmail: input.businessEmail }),
      ...(input.authorizedSignatory !== undefined && {
        authorizedSignatory: input.authorizedSignatory,
      }),
      ...(input.paymentInfo !== undefined && { paymentInfo: input.paymentInfo }),
      ...(input.customerName !== undefined && { customerName: input.customerName }),
      ...(input.customerAddress !== undefined && { customerAddress: input.customerAddress }),
      ...(input.customerPhone !== undefined && { customerPhone: input.customerPhone }),
      ...(input.customerEmail !== undefined && { customerEmail: input.customerEmail }),
      ...(input.discountType !== undefined && { discountType: mapDiscountType(input.discountType) }),
      ...(input.discountPercent !== undefined && { discountPercent: input.discountPercent }),
      discountAmount: amounts.discount,
      subtotal: amounts.subtotal,
      totalAmount: amounts.totalAmount,
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.bookingId !== undefined && { bookingId }),
      ...(input.lineItems !== undefined && {
        lineItems: {
          deleteMany: {},
          create: input.lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            sortOrder: index,
          })),
        },
      }),
    });

    return toInvoiceResponse(invoice);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const invoice = await this.repository.findById(id);

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Invoice deleted' };
  }

  private async validateBooking(bookingId: bigint | null | undefined): Promise<void> {
    if (!bookingId) {
      return;
    }

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
  }
}
