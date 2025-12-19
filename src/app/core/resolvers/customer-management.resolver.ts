import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GuestService } from '../services/guest.service';
import { Guest } from '../models/models';

export type CustomerManagementResolved = {
  guests: Guest[];
};

export const customerManagementResolver: ResolveFn<CustomerManagementResolved> = async () => {
  const guestService = inject(GuestService);
  const guests = await guestService.getGuests();
  return { guests };
};

