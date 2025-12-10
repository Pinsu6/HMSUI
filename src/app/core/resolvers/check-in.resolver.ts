import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Room } from '../models/models';

export type CheckInResolved = {
  availableRooms: Room[];
};

export const checkInResolver: ResolveFn<CheckInResolved> = async () => {
  const roomService = inject(RoomService);
  const availableRooms = await roomService.getAvailableRooms();
  return { availableRooms };
};

