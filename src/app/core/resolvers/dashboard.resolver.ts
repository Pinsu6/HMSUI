import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { RoomService } from '../services/room.service';
import { BookingService } from '../services/booking.service';
import { DashboardStats, Booking, Room } from '../models/models';

export type DashboardResolvedData = {
  stats: DashboardStats;
  checkIns: Booking[];
  checkOuts: Booking[];
  rooms: Room[];
  thisWeekBookings: Booking[];
  activeBookings: Booking[];
};

export const dashboardResolver: ResolveFn<DashboardResolvedData> = async () => {
  const dashboardService = inject(DashboardService);
  const roomService = inject(RoomService);
  const bookingService = inject(BookingService);

  const [stats, checkIns, checkOuts, rooms, thisWeekBookings, activeBookings] = await Promise.all([
    dashboardService.getStats(),
    dashboardService.getTodaysCheckIns(),
    dashboardService.getTodaysCheckOuts(),
    roomService.getRooms(),
    dashboardService.getThisWeeksBookings(),
    bookingService.getActiveBookings()
  ]);

  return { stats, checkIns, checkOuts, rooms, thisWeekBookings, activeBookings };
};

