import type { PrismaClient } from '@prisma/client';
import { loadEnv } from '../../config/env.js';
import { toCalendarEventResponse } from '../events/event.mapper.js';
import { sumDecimalAmounts } from '../payments/payment.mapper.js';
import { DashboardRepository } from './dashboard.repository.js';
import type { DashboardResponse } from './dashboard.types.js';

export class DashboardService {
  private readonly repository: DashboardRepository;

  constructor(prisma: PrismaClient) {
    const timeZone = loadEnv().TZ;
    this.repository = new DashboardRepository(prisma, timeZone);
  }

  async getDashboard(): Promise<DashboardResponse> {
    const metrics = await this.repository.getMetrics();

    return {
      todaysEvents: metrics.todaysEvents.map(toCalendarEventResponse),
      upcomingEvents: metrics.upcomingEvents.map(toCalendarEventResponse),
      pendingFollowups: metrics.pendingFollowups,
      monthlyRevenue: metrics.monthlyRevenue._sum.amount
        ? sumDecimalAmounts([metrics.monthlyRevenue._sum.amount])
        : '0.00',
      todaysCollections: metrics.todaysCollections._sum.amount
        ? sumDecimalAmounts([metrics.todaysCollections._sum.amount])
        : '0.00',
      newLeads: metrics.newLeads,
      bookings: metrics.bookings,
      cancelledEvents: metrics.cancelledEvents,
    };
  }
}
