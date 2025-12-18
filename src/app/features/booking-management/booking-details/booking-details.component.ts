import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { GuestService } from '../../../core/services/guest.service';
import { Booking } from '../../../core/models/models';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private guestService: GuestService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadBooking(id);
      }
    });
  }

  async loadBooking(id: number) {
    this.loading = true;
    this.booking = null;
    this.cdr.detectChanges();

    try {
      this.booking = await this.bookingService.getBooking(id);

      // Fetch full guest details using guestId
      if (this.booking && this.booking.guestId) {
        try {
          const fullGuestInfo = await this.guestService.getGuest(this.booking.guestId);
          this.booking.guest = fullGuestInfo;
        } catch (guestErr) {
          console.warn('Failed to fetch full guest info', guestErr);
        }
      }
    } catch (error) {
      console.error('Error loading booking details', error);
      this.booking = null;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/bookings']);
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
