import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';
import { GuestService } from '../../core/services/guest.service';
import { Room, CheckInDto } from '../../core/models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckInResolved } from '../../core/resolvers/check-in.resolver';

@Component({
  selector: 'app-check-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.css'
})
export class CheckInComponent implements OnInit {
  // Current Step
  currentStep = 1;
  totalSteps = 4;

  // Loading state
  loading = false;
  submitting = false;

  // Available Rooms from API
  availableRooms: Room[] = [];

  // Selected Room
  selectedRoom: Room | null = null;

  // Guest Details
  guestDetails = {
    fullName: '',
    mobile: '',
    email: '',
    idType: 'Aadhar Card',
    idNumber: '',
    address: '',
    city: '',
    country: 'India',
    purpose: 'Business',
    specialRequests: ''
  };

  // ID Types
  idTypes = ['Aadhar Card', 'Passport', 'Driving License', 'Voter ID', 'PAN Card'];
  purposes = ['Business', 'Leisure', 'Wedding', 'Conference', 'Medical', 'Other'];

  // Booking Details
  bookingDetails = {
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '11:00',
    adults: 1,
    children: 0,
    extraBed: false
  };

  // Payment Details
  paymentDetails = {
    advancePayment: 0,
    paymentMode: 'Cash',
    transactionId: ''
  };

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private guestService: GuestService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // Room Types
  uniqueRoomTypes: string[] = [];
  selectedRoomType: string = 'All';

  ngOnInit() {
    this.setToday();
    this.setTomorrow();
    const resolved = this.route.snapshot.data['data'] as CheckInResolved | undefined;
    if (resolved) {
      this.availableRooms = resolved.availableRooms;
      this.extractRoomTypes();
      this.loading = false;
    } else {
      this.loadAvailableRooms();
    }
  }

  async loadAvailableRooms(): Promise<void> {
    this.loading = true;
    try {
      this.availableRooms = await this.roomService.getAvailableRooms();
      this.extractRoomTypes();
    } catch (err) {
      console.error('Failed to load available rooms:', err);
    } finally {
      this.loading = false;
    }
  }

  private extractRoomTypes() {
    const types = new Set(this.availableRooms.map(r => r.roomType?.name).filter(Boolean) as string[]);
    this.uniqueRoomTypes = ['All', ...Array.from(types).sort()];
    // Optional: Default to first type if not 'All', but 'All' is safer
  }

  get filteredRooms(): Room[] {
    if (this.selectedRoomType === 'All') {
      return this.availableRooms;
    }
    return this.availableRooms.filter(r => r.roomType?.name === this.selectedRoomType);
  }

  // Calculated Values
  get totalNights(): number {
    if (!this.bookingDetails.checkInDate || !this.bookingDetails.checkOutDate) return 0;
    const checkIn = new Date(this.bookingDetails.checkInDate);
    const checkOut = new Date(this.bookingDetails.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get roomCharges(): number {
    if (!this.selectedRoom) return 0;
    const baseRate = this.selectedRoom.roomType?.baseRate || 0;
    return baseRate * this.totalNights;
  }

  get extraBedCharges(): number {
    return this.bookingDetails.extraBed ? 500 * this.totalNights : 0;
  }

  get subtotal(): number {
    return this.roomCharges + this.extraBedCharges;
  }

  get taxAmount(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get totalAmount(): number {
    return this.subtotal + this.taxAmount;
  }

  get balanceAmount(): number {
    return this.totalAmount - this.paymentDetails.advancePayment;
  }

  // Methods
  selectRoom(room: Room) {
    this.selectedRoom = room;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.selectedRoom !== null;
      case 2:
        return this.guestDetails.fullName !== '' &&
          this.guestDetails.mobile !== '' &&
          this.guestDetails.idNumber !== '';
      case 3:
        return this.bookingDetails.checkInDate !== '' &&
          this.bookingDetails.checkOutDate !== '' &&
          this.totalNights > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }

  async confirmCheckIn() {
    if (!this.selectedRoom) return;

    this.submitting = true;

    try {
      // Step 1: Insert/update guest using the Guest API
      const guestResponse = await this.guestService.insertUpdateGuest({
        guestId: 0,
        fullName: this.guestDetails.fullName,
        mobile: this.guestDetails.mobile,
        email: this.guestDetails.email || undefined,
        idType: this.guestDetails.idType,
        idNumber: this.guestDetails.idNumber,
        address: this.guestDetails.address || undefined,
        city: this.guestDetails.city || undefined,
        country: this.guestDetails.country || undefined
      });

      console.log('Guest API Response:', guestResponse);

      // Extract guestId from response - API might return different formats
      let guestId = 0;

      if (guestResponse.responseData) {
        const guestData = JSON.parse(guestResponse.responseData);
        console.log('Parsed Guest Data:', guestData);

        // Could be an array or single object
        if (Array.isArray(guestData) && guestData.length > 0) {
          guestId = guestData[0].GuestId || guestData[0].guestId || guestData[0].Id || 0;
        } else if (typeof guestData === 'object') {
          guestId = guestData.GuestId || guestData.guestId || guestData.Id || 0;
        } else if (typeof guestData === 'number') {
          guestId = guestData;
        }
      } else if (guestResponse.data) {
        // Alternative response structure
        const data = guestResponse.data;
        if (Array.isArray(data) && data.length > 0) {
          guestId = data[0].GuestId || data[0].guestId || 0;
        } else {
          guestId = data.GuestId || data.guestId || 0;
        }
      } else {
        // Direct response
        guestId = guestResponse.GuestId || guestResponse.guestId || guestResponse.Id || guestResponse.id || 0;
      }

      console.log('Extracted Guest ID:', guestId);

      if (guestId === 0) {
        console.error('Failed to extract guestId from response:', guestResponse);
        alert('Guest creation failed - could not get Guest ID. Please check console for details.');
        this.submitting = false;
        return;
      }

      const checkInDateTime = new Date(`${this.bookingDetails.checkInDate}T${this.bookingDetails.checkInTime || '14:00'}`);
      const checkOutDateTime = new Date(`${this.bookingDetails.checkOutDate}T${this.bookingDetails.checkOutTime}`);

      // Step 2: Create booking using the Booking API
      const bookingResponse = await this.bookingService.insertUpdateBooking({
        bookingId: 0,
        guestId: guestId,
        roomId: this.selectedRoom.roomId,
        checkInTime: checkInDateTime.toISOString(),
        expectedCheckOutTime: checkOutDateTime.toISOString(),
        adults: this.bookingDetails.adults,
        children: this.bookingDetails.children,
        totalAmount: this.totalAmount,
        taxAmount: this.taxAmount,
        status: 'Active'
      });

      console.log('Booking created:', bookingResponse);

      this.submitting = false;
      alert(`Check-in successful! Room ${this.selectedRoom?.number} is now occupied.`);
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.submitting = false;
      console.error('Check-in failed:', err);
      alert('Check-in failed. Please try again.');
    }
  }

  resetForm(): void {
    this.currentStep = 1;
    this.selectedRoom = null;
    this.guestDetails = {
      fullName: '',
      mobile: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      address: '',
      city: '',
      country: 'India',
      purpose: 'Business',
      specialRequests: ''
    };
    this.setToday();
    this.setTomorrow();
    this.paymentDetails = {
      advancePayment: 0,
      paymentMode: 'Cash',
      transactionId: ''
    };
  }

  setToday() {
    const today = new Date();
    this.bookingDetails.checkInDate = today.toISOString().split('T')[0];
    this.bookingDetails.checkInTime = today.toTimeString().slice(0, 5);
  }

  setTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.bookingDetails.checkOutDate = tomorrow.toISOString().split('T')[0];
  }

  decrementAdults() {
    this.bookingDetails.adults = Math.max(1, this.bookingDetails.adults - 1);
  }

  decrementChildren() {
    this.bookingDetails.children = Math.max(0, this.bookingDetails.children - 1);
  }

  getRoomType(room: Room): string {
    return room.roomType?.name || 'Standard';
  }

  getRoomBaseRate(room: Room): number {
    return room.roomType?.baseRate || 0;
  }

  getRoomMaxGuests(room: Room): number {
    return room.roomType?.maxGuests || 2;
  }
}
