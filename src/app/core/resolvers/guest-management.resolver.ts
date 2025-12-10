import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GuestService } from '../services/guest.service';
import { Guest } from '../models/models';

export type GuestManagementResolved = {
  guests: Guest[];
};

export const guestManagementResolver: ResolveFn<GuestManagementResolved> = async () => {
  const guestService = inject(GuestService);
  const guests = await guestService.getGuests();
  return { guests };
};

