import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { Booking } from '../models/models';

export type CheckOutResolved = {
  activeBookings: Booking[];
};

export const checkOutResolver: ResolveFn<CheckOutResolved> = async () => {
  const bookingService = inject(BookingService);
  const activeBookings = await bookingService.getActiveBookings();
  return { activeBookings };
};

