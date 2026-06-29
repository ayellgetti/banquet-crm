import type { CalendarEventResponse } from '../events/event.types.js';

export interface DashboardResponse {
  todaysEvents: CalendarEventResponse[];
  upcomingEvents: CalendarEventResponse[];
  pendingFollowups: number;
  monthlyRevenue: string;
  todaysCollections: string;
  newLeads: number;
  bookings: number;
  cancelledEvents: number;
}
