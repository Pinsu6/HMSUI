import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { GuestService } from '../../../core/services/guest.service';
import { BillingService } from '../../../core/services/billing.service';
import { Booking, Charge, Payment } from '../../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;
  charges: Charge[] = [];

  // Charge Modal
  showAddChargeModal = false;
  newCharge = {
    description: '',
    amount: 0,
    category: 'Service'
  };

  predefinedServices = [
    { name: 'Room Service - Breakfast', price: 500, category: 'Food & Beverage' },
    { name: 'Room Service - Lunch', price: 900, category: 'Food & Beverage' },
    { name: 'Room Service - Dinner', price: 1200, category: 'Food & Beverage' },
    { name: 'Laundry - Shirt', price: 150, category: 'Laundry' },
    { name: 'Laundry - Pant', price: 200, category: 'Laundry' },
    { name: 'Extra Bed', price: 1000, category: 'Service' },
    { name: 'Airport Taxi', price: 1500, category: 'Transportation' },
    { name: 'Spa - Massage', price: 2500, category: 'Spa & Wellness' },
    { name: 'Mini Bar - Water', price: 50, category: 'Food & Beverage' },
    { name: 'Late Check-out Fee', price: 2000, category: 'Service' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private guestService: GuestService,
    private billingService: BillingService,
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

      // Fetch charges
      try {
        this.charges = await this.billingService.getChargesByBooking(id);
        this.cdr.detectChanges();
      } catch (chargeErr) {
        console.warn('Failed to fetch charges', chargeErr);
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

  // Charge Methods
  openAddChargeModal() {
    this.newCharge = { description: '', amount: 0, category: 'Service' };
    this.showAddChargeModal = true;
  }

  async saveCharge() {
    if (!this.booking) return;

    try {
      const addedCharge = await this.billingService.addCharge({
        bookingId: this.booking.bookingId,
        description: this.newCharge.description,
        amount: this.newCharge.amount,
        category: this.newCharge.category,
        date: new Date()
      });

      this.charges.push(addedCharge);

      // Update local booking total if needed or just rely on display
      // User requested "wo charz totalamount mai add hoga"
      // We can update the UI immediately
      if (this.booking.totalAmount !== undefined) {
        this.booking.totalAmount += this.newCharge.amount;
      }

      alert('Charge added successfully');
      this.showAddChargeModal = false;
    } catch (err) {
      console.error('Failed to add charge:', err);
      alert('Failed to add charge');
    }
  }

  onServiceSelect(event: any) {
    const serviceName = event.target.value;
    const service = this.predefinedServices.find(s => s.name === serviceName);

    if (service) {
      this.newCharge = {
        description: service.name,
        amount: service.price,
        category: service.category
      };
    } else {
      // Reset if user selects the placeholder
      this.newCharge = {
        description: '',
        amount: 0,
        category: 'Service'
      };
    }
  }

  get totalCharges(): number {
    return this.charges.reduce((sum, c) => sum + c.amount, 0);
  }
}
