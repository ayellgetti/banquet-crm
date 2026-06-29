import {
  EventStatus,
  LeadStatus,
  PaymentType,
  type PrismaClient,
} from '@prisma/client';
import {
  getDateKeyInTimezone,
  getDayBoundsInTimezone,
  getMonthBoundsInTimezone,
  getStartOfTodayInTimezone,
  parseDateKey,
} from '../../utils/timezone.js';

const OPEN_ENQUIRY_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.FOLLOW_UP,
  LeadStatus.QUOTATION_SENT,
  LeadStatus.NEGOTIATION,
];

export class DashboardRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly timeZone: string,
  ) {}

  async getMetrics() {
    const todayKey = getDateKeyInTimezone(this.timeZone);
    const todayDate = parseDateKey(todayKey);
    const { start: todayStart, end: todayEnd } = getDayBoundsInTimezone(this.timeZone);
    const { start: monthStart, end: monthEnd } = getMonthBoundsInTimezone(this.timeZone);
    const startOfToday = getStartOfTodayInTimezone(this.timeZone);

    const [
      todaysEvents,
      upcomingEvents,
      pendingFollowups,
      monthlyRevenue,
      todaysCollections,
      newLeads,
      bookings,
      cancelledEvents,
    ] = await Promise.all([
      this.prisma.event.findMany({
        where: {
          eventDate: todayDate,
          status: { not: EventStatus.CANCELLED },
        },
        include: { customer: true },
        orderBy: [{ timeSlot: 'asc' }, { eventType: 'asc' }],
      }),
      this.prisma.event.findMany({
        where: {
          eventDate: { gt: todayDate },
          status: { in: [EventStatus.TENTATIVE, EventStatus.CONFIRMED] },
        },
        include: { customer: true },
        orderBy: { eventDate: 'asc' },
        take: 10,
      }),
      this.prisma.followUp.count({
        where: {
          nextFollowupDate: { gte: startOfToday },
          enquiry: { status: { in: OPEN_ENQUIRY_STATUSES } },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          paymentType: PaymentType.INCOME,
          transactionDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          paymentType: PaymentType.INCOME,
          transactionDate: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.enquiry.count({
        where: {
          status: LeadStatus.NEW,
          enquiryDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      this.prisma.booking.count({
        where: {
          bookingDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      this.prisma.event.count({
        where: {
          status: EventStatus.CANCELLED,
          eventDate: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    return {
      todaysEvents,
      upcomingEvents,
      pendingFollowups,
      monthlyRevenue,
      todaysCollections,
      newLeads,
      bookings,
      cancelledEvents,
    };
  }
}
