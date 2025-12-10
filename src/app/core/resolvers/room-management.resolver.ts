import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Room, RoomType } from '../models/models';

export type RoomManagementResolved = {
  types: RoomType[];
  rooms: Room[];
};

export const roomManagementResolver: ResolveFn<RoomManagementResolved> = async () => {
  const roomService = inject(RoomService);

  const [types, rooms] = await Promise.all([
    roomService.getRoomTypes(),
    roomService.getRooms()
  ]);

  return { types, rooms };
};

