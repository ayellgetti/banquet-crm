import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toBookingResponse } from './booking.mapper.js';
import { BookingRepository } from './booking.repository.js';
import type {
  CreateBookingInput,
  ListBookingsQuery,
  UpdateBookingInput,
} from './booking.schema.js';
import { calculateFinalAmount, parseBigIntId } from './booking.schema.js';
import type { BookingResponse } from './booking.types.js';

export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListBookingsQuery): Promise<PaginatedResult<BookingResponse>> {
    const [bookings, total] = await this.repository.findAll(query);

    return {
      items: bookings.map(toBookingResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<BookingResponse> {
    const booking = await this.repository.findById(id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return toBookingResponse(booking);
  }

  async create(input: CreateBookingInput): Promise<BookingResponse> {
    const eventId = parseBigIntId(input.eventId);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { booking: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.booking) {
      throw new AppError('A booking already exists for this event', 409);
    }

    const finalAmount = calculateFinalAmount(input.totalAmount, input.discount);
    const bookingNumber = await this.generateBookingNumber(
      input.bookingDate ? new Date(input.bookingDate) : new Date(),
    );

    const booking = await this.repository.create({
      eventId,
      bookingNumber,
      bookingDate: input.bookingDate ? new Date(input.bookingDate) : undefined,
      totalAmount: input.totalAmount,
      advanceAmount: input.advanceAmount,
      discount: input.discount,
      finalAmount,
      status: input.status,
      comments: input.comments,
    });

    return toBookingResponse(booking);
  }

  async update(id: bigint, input: UpdateBookingInput): Promise<BookingResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Booking not found', 404);
    }

    const totalAmount =
      input.totalAmount ?? Number(existing.totalAmount.toString());
    const discount = input.discount ?? Number(existing.discount.toString());
    const finalAmount = calculateFinalAmount(totalAmount, discount);

    const booking = await this.repository.update(id, {
      ...(input.bookingDate !== undefined && { bookingDate: new Date(input.bookingDate) }),
      ...(input.totalAmount !== undefined && { totalAmount: input.totalAmount }),
      ...(input.advanceAmount !== undefined && { advanceAmount: input.advanceAmount }),
      ...(input.discount !== undefined && { discount: input.discount }),
      finalAmount,
      ...(input.status !== undefined && { status: input.status }),
      ...(input.comments !== undefined && { comments: input.comments }),
    });

    return toBookingResponse(booking);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const booking = await this.repository.findById(id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Booking deleted' };
  }

  private async generateBookingNumber(referenceDate: Date): Promise<string> {
    const year = referenceDate.getFullYear();
    const prefix = `BK-${year}-`;
    const latest = await this.repository.findLatestBookingNumberForYear(year);

    let sequence = 1;

    if (latest?.bookingNumber) {
      const suffix = latest.bookingNumber.slice(prefix.length);
      const parsed = Number.parseInt(suffix, 10);
      sequence = Number.isNaN(parsed) ? 1 : parsed + 1;
    }

    return `${prefix}${String(sequence).padStart(5, '0')}`;
  }
}
