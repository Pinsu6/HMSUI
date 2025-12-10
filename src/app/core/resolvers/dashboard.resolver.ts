import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { RoomService } from '../services/room.service';
import { DashboardStats, Booking, Room } from '../models/models';

export type DashboardResolvedData = {
  stats: DashboardStats;
  checkIns: Booking[];
  checkOuts: Booking[];
  rooms: Room[];
};

export const dashboardResolver: ResolveFn<DashboardResolvedData> = async () => {
  const dashboardService = inject(DashboardService);
  const roomService = inject(RoomService);

  const [stats, checkIns, checkOuts, rooms] = await Promise.all([
    dashboardService.getStats(),
    dashboardService.getTodaysCheckIns(),
    dashboardService.getTodaysCheckOuts(),
    roomService.getRooms()
  ]);

  return { stats, checkIns, checkOuts, rooms };
};

