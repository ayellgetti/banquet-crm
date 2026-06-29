import { PaymentType, type PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { sumDecimalAmounts, toPaymentResponse } from './payment.mapper.js';
import { PaymentRepository } from './payment.repository.js';
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  PaymentReportQuery,
  UpdatePaymentInput,
} from './payment.schema.js';
import { parseBigIntId, parseOptionalBigInt } from './payment.schema.js';
import type { PaymentReportResult, PaymentResponse } from './payment.types.js';

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListPaymentsQuery): Promise<PaginatedResult<PaymentResponse>> {
    const [payments, total] = await this.repository.findAll(query);

    return {
      items: payments.map(toPaymentResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getIncomeReport(query: PaymentReportQuery): Promise<PaymentReportResult> {
    return this.getReport(PaymentType.INCOME, query);
  }

  async getExpenseReport(query: PaymentReportQuery): Promise<PaymentReportResult> {
    return this.getReport(PaymentType.EXPENSE, query);
  }

  async getById(id: bigint): Promise<PaymentResponse> {
    const payment = await this.repository.findById(id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return toPaymentResponse(payment);
  }

  async create(input: CreatePaymentInput, createdById?: string): Promise<PaymentResponse> {
    const bookingId = parseOptionalBigInt(input.bookingId);
    const vendorId = parseOptionalBigInt(input.vendorId);

    await this.validatePaymentRelations(input.paymentType, bookingId, vendorId);

    const payment = await this.repository.create({
      bookingId,
      vendorId,
      paymentType: input.paymentType,
      transactionType: input.transactionType,
      transactionDate: input.transactionDate ? new Date(input.transactionDate) : undefined,
      paymentMode: input.paymentMode,
      amount: input.amount,
      description: input.description,
      receivedFrom: input.receivedFrom,
      paidTo: input.paidTo,
      createdBy: createdById ? parseBigIntId(createdById) : undefined,
    });

    return toPaymentResponse(payment);
  }

  async update(id: bigint, input: UpdatePaymentInput): Promise<PaymentResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Payment not found', 404);
    }

    const paymentType = input.paymentType ?? existing.paymentType;
    const bookingId =
      input.bookingId !== undefined
        ? parseOptionalBigInt(input.bookingId)
        : existing.bookingId;
    const vendorId =
      input.vendorId !== undefined ? parseOptionalBigInt(input.vendorId) : existing.vendorId;

    await this.validatePaymentRelations(paymentType, bookingId, vendorId);

    const payment = await this.repository.update(id, {
      ...(input.bookingId !== undefined && { bookingId }),
      ...(input.vendorId !== undefined && { vendorId }),
      ...(input.paymentType !== undefined && { paymentType: input.paymentType }),
      ...(input.transactionType !== undefined && { transactionType: input.transactionType }),
      ...(input.transactionDate !== undefined && {
        transactionDate: new Date(input.transactionDate),
      }),
      ...(input.paymentMode !== undefined && { paymentMode: input.paymentMode }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.receivedFrom !== undefined && { receivedFrom: input.receivedFrom }),
      ...(input.paidTo !== undefined && { paidTo: input.paidTo }),
    });

    return toPaymentResponse(payment);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const payment = await this.repository.findById(id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Payment deleted' };
  }

  private async getReport(
    paymentType: PaymentType,
    query: PaymentReportQuery,
  ): Promise<PaymentReportResult> {
    const [payments, total, aggregate] = await this.repository.findReport(paymentType, query);

    return {
      items: payments.map(toPaymentResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
      totalAmount: aggregate._sum.amount
        ? sumDecimalAmounts([aggregate._sum.amount])
        : '0.00',
    };
  }

  private async validatePaymentRelations(
    _paymentType: PaymentType,
    bookingId: bigint | null | undefined,
    vendorId: bigint | null | undefined,
  ): Promise<void> {
    if (bookingId) {
      const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }
    }

    if (vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });

      if (!vendor) {
        throw new AppError('Vendor not found', 404);
      }
    }
  }
}
