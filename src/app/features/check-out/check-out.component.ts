import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { BillingService } from '../../core/services/billing.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Booking, Charge, CheckOutDto, CreateInvoiceDto, AdditionalChargeDto } from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { CheckOutResolved } from '../../core/resolvers/check-out.resolver';

@Component({
  selector: 'app-check-out',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css'
})
export class CheckOutComponent implements OnInit {
  // Search
  searchQuery = '';
  selectedBooking: Booking | null = null;
  showBillingModal = false;

  // Loading states
  loading = false;
  submitting = false;

  // Active Bookings from API
  activeBookings: Booking[] = [];

  // Charges for selected booking
  charges: Charge[] = [];

  // New Charge Form
  newCharge = {
    description: '',
    category: 'Food & Beverage',
    amount: 0
  };

  // Charge Categories
  chargeCategories = [
    'Food & Beverage',
    'Laundry',
    'Mini Bar',
    'Room Service',
    'Extra Bed',
    'Late Check-out',
    'Early Check-in',
    'Spa & Wellness',
    'Transportation',
    'Miscellaneous'
  ];

  // Discount
  discountPercent = 0;
  discountAmount = 0;

  // Payment
  paymentMode = 'Cash';
  paymentAmount = 0;
  transactionId = '';

  constructor(
    private bookingService: BookingService,
    private billingService: BillingService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['data'] as CheckOutResolved | undefined;
    if (resolved) {
      this.activeBookings = resolved.activeBookings;
      this.loading = false;
    } else {
      this.loadActiveBookings();
    }
  }

  async loadActiveBookings(): Promise<void> {
    this.loading = true;
    try {
      this.activeBookings = await this.bookingService.getActiveBookings();
    } catch (err) {
      console.error('Failed to load active bookings:', err);
    } finally {
      this.loading = false;
    }
  }

  // Get filtered bookings
  get filteredBookings(): Booking[] {
    if (!this.searchQuery) return this.activeBookings;
    const query = this.searchQuery.toLowerCase();
    return this.activeBookings.filter(b =>
      b.room?.number.includes(query) ||
      b.guest?.fullName.toLowerCase().includes(query) ||
      b.guest?.mobile.includes(query)
    );
  }

  // Get today's checkouts
  get todaysCheckouts(): Booking[] {
    const today = new Date().toISOString().split('T')[0];
    return this.activeBookings.filter(b => {
      const checkoutDate = new Date(b.expectedCheckOutTime).toISOString().split('T')[0];
      return checkoutDate === today;
    });
  }

  // Get today's checkout room numbers as a string
  get todaysCheckoutRooms(): string {
    return this.todaysCheckouts.map(b => b.room?.number).join(', ');
  }

  // Calculate nights
  getNights(booking: Booking): number {
    const checkIn = new Date(booking.checkInTime);
    const checkOut = new Date(booking.expectedCheckOutTime);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculations
  get roomCharges(): number {
    if (!this.selectedBooking) return 0;
    const nights = this.getNights(this.selectedBooking);
    const rate = this.getRoomRate(this.selectedBooking);
    return nights * rate;
  }

  get additionalCharges(): number {
    return this.charges.reduce((sum, c) => sum + c.amount, 0);
  }

  get subtotal(): number {
    return this.roomCharges + this.additionalCharges;
  }

  get calculatedDiscount(): number {
    if (this.discountPercent > 0) {
      return Math.round(this.subtotal * this.discountPercent / 100);
    }
    return this.discountAmount;
  }

  get afterDiscount(): number {
    return this.subtotal - this.calculatedDiscount;
  }

  get taxAmount(): number {
    return Math.round(this.afterDiscount * 0.18);
  }

  get totalAmount(): number {
    return this.afterDiscount + this.taxAmount;
  }

  get balanceAmount(): number {
    return this.totalAmount - this.paymentAmount;
  }

  // Methods
  selectBooking(booking: Booking) {
    this.selectedBooking = booking;
    this.loadCharges(booking.bookingId);
    this.showBillingModal = true;
  }

  async loadCharges(bookingId: number) {
    try {
      this.charges = await this.billingService.getChargesByBooking(bookingId);
    } catch (err) {
      console.error('Failed to load charges:', err);
    }
  }

  async addCharge() {
    if (!this.selectedBooking) return;
    if (this.newCharge.description && this.newCharge.amount > 0) {
      try {
        const charge = await this.billingService.addCharge({
          bookingId: this.selectedBooking.bookingId,
          description: this.newCharge.description,
          category: this.newCharge.category,
          amount: this.newCharge.amount
        });
        this.charges.push(charge);
        this.newCharge = { description: '', category: 'Food & Beverage', amount: 0 };
      } catch (err) {
        console.error('Failed to add charge:', err);
      }
    }
  }

  async removeCharge(index: number) {
    const charge = this.charges[index];
    if (charge.chargeId) {
      try {
        await this.billingService.deleteCharge(charge.chargeId);
        this.charges.splice(index, 1);
      } catch (err) {
        console.error('Failed to delete charge:', err);
      }
    } else {
      this.charges.splice(index, 1);
    }
  }

  closeModal() {
    this.showBillingModal = false;
    this.selectedBooking = null;
    this.charges = [];
    this.discountPercent = 0;
    this.discountAmount = 0;
    this.paymentAmount = 0;
  }

  async processCheckout() {
    if (!this.selectedBooking) return;

    this.submitting = true;

    const dto: CheckOutDto = {
      discountAmount: this.calculatedDiscount,
      paymentAmount: this.paymentAmount,
      paymentMode: this.paymentMode
    };

    try {
      await this.bookingService.checkOut(this.selectedBooking.bookingId, dto);

      // Create Invoice after successful checkout
      const additionalCharges: AdditionalChargeDto[] = this.charges.map(charge => ({
        description: charge.description,
        quantity: 1,
        rate: charge.amount,
        amount: charge.amount
      }));

      const invoiceDto: CreateInvoiceDto = {
        bookingId: this.selectedBooking.bookingId,
        invoiceNumber: `INV-${this.selectedBooking.bookingId}-${Date.now()}`,
        pdfPath: '',
        createdOn: new Date().toISOString(),
        guestName: this.selectedBooking.guest?.fullName || '',
        guestMobile: this.selectedBooking.guest?.mobile || '',
        guestEmail: this.selectedBooking.guest?.email || '',
        idProofType: this.selectedBooking.guest?.idType || '',
        idProofNumber: this.selectedBooking.guest?.idNumber || '',
        roomNumber: this.selectedBooking.room?.number || '',
        roomType: this.selectedBooking.room?.roomType?.name || '',
        checkInDate: new Date(this.selectedBooking.checkInTime).toISOString(),
        checkOutDate: new Date().toISOString(),
        adults: this.selectedBooking.adults,
        children: this.selectedBooking.children,
        totalNights: this.getNights(this.selectedBooking),
        roomRate: this.selectedBooking.room?.roomType?.baseRate || 0,
        subTotal: this.subtotal,
        taxPercentage: 18,
        taxAmount: this.taxAmount,
        discount: this.calculatedDiscount,
        grandTotal: this.totalAmount,
        paymentStatus: this.balanceAmount <= 0 ? 'Paid' : 'Pending',
        paymentMethod: this.paymentMode,
        additionalCharges: additionalCharges
      };

      try {
        await this.invoiceService.createInvoice(invoiceDto);
        console.log('Invoice created successfully');
      } catch (invoiceErr) {
        console.error('Failed to create invoice:', invoiceErr);
        // Don't block checkout if invoice creation fails
      }

      this.submitting = false;
      alert(`Check-out successful for Room ${this.selectedBooking?.room?.number}!\n\nTotal: ₹${this.totalAmount}\nBalance: ₹${this.balanceAmount}\n\nWiFi access has been deactivated.\nRoom marked as "Dirty" for cleaning.`);
      this.closeModal();
      this.loadActiveBookings();
    } catch (err) {
      this.submitting = false;
      console.error('Check-out failed:', err);
      alert('Check-out failed. Please try again.');
    }
  }

  generateInvoice() {
    alert('Invoice generated and ready for download!');
  }

  // Helper methods for template
  getRoomNumber(booking: Booking): string {
    return booking.room?.number || '';
  }

  getRoomType(booking: Booking): string {
    return booking.room?.roomType?.name || '';
  }

  getGuestName(booking: Booking): string {
    return booking.guest?.fullName || '';
  }

  getGuestMobile(booking: Booking): string {
    return booking.guest?.mobile || '';
  }

  getCheckInDate(booking: Booking): string {
    return new Date(booking.checkInTime).toISOString().split('T')[0];
  }

  getCheckOutDate(booking: Booking): string {
    return new Date(booking.expectedCheckOutTime).toISOString().split('T')[0];
  }

  getRoomRate(booking: Booking): number {
    const baseRate = booking.room?.roomType?.baseRate;
    if (baseRate && baseRate > 0) {
      return baseRate;
    }

    // Fallback: derive a per-night rate from totalAmount when API doesn't supply roomType.baseRate
    const nights = this.getNights(booking) || 1;
    if (booking.totalAmount && booking.totalAmount > 0) {
      return Math.round(booking.totalAmount / nights);
    }

    return 0;
  }

  isDueToday(booking: Booking): boolean {
    const today = new Date().toISOString().split('T')[0];
    const checkOut = new Date(booking.expectedCheckOutTime).toISOString().split('T')[0];
    return checkOut === today;
  }
}
