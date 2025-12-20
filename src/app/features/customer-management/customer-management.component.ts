import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestService } from '../../core/services/guest.service';
import { BookingService } from '../../core/services/booking.service';
import { BillingService } from '../../core/services/billing.service';
import { SettingsService } from '../../core/services/settings.service';
import { Guest, Booking } from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { CustomerManagementResolved } from '../../core/resolvers/customer-management.resolver';

interface GuestDisplay extends Guest {
  totalVisits?: number;
  lastVisit?: string;
  totalSpent?: number;
  status?: 'active' | 'checked-out';
  currentRoom?: string;
}

@Component({
  selector: 'app-customer-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.css'
})
export class CustomerManagementComponent implements OnInit {
  // Search & Filters
  searchQuery = '';
  statusFilter = 'all';
  viewMode: 'grid' | 'list' = 'grid';

  // Loading state
  loading = false;

  // Modal States
  showAddGuestModal = false;
  showGuestDetailsModal = false;
  selectedGuest: GuestDisplay | null = null;
  guestHistory: Booking[] = [];

  // Charge Modal
  showAddChargeModal = false;
  newCharge = {
    description: '',
    amount: 0,
    category: 'Service'
  };

  // ID Types
  idTypes = ['Aadhar Card', 'Passport', 'Driving License', 'Voter ID', 'PAN Card'];

  // Guests from API
  guests: GuestDisplay[] = [];

  // New Guest Form
  newGuest = {
    fullName: '',
    mobile: '',
    email: '',
    idType: 'Aadhar Card',
    idNumber: '',
    address: '',
    city: '',
    country: 'India'
  };

  constructor(
    private guestService: GuestService,
    private bookingService: BookingService,
    private billingService: BillingService,
    private route: ActivatedRoute,
    public settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['data'] as CustomerManagementResolved | undefined;
    if (resolved) {
      this.setGuests(resolved.guests);
      this.loading = false;
    } else {
      this.loadGuests();
    }
  }

  async loadGuests(): Promise<void> {
    this.loading = true;

    try {
      // Load guests and active bookings in parallel
      const [guests, activeBookings] = await Promise.all([
        this.guestService.getGuests(),
        this.bookingService.getActiveBookings()
      ]);

      // Create a map of active bookings by guestId for faster lookup
      const activeBookingMap = new Map<number, Booking>();
      activeBookings.forEach(booking => {
        activeBookingMap.set(booking.guestId, booking);
      });

      // Map guests with status and current room
      this.guests = guests.map(guest => {
        const activeBooking = activeBookingMap.get(guest.guestId);
        return {
          ...guest,
          totalVisits: 0, // Ideally this would come from API or history count
          lastVisit: undefined,
          totalSpent: 0,
          status: activeBooking ? 'active' : 'checked-out',
          currentRoom: activeBooking?.room?.number
        };
      });

    } catch (err) {
      console.error('Failed to load guest data:', err);
      // Fallback to empty list or handle error appropriately
      this.guests = [];
    } finally {
      this.loading = false;
    }
  }

  private setGuests(guests: Guest[]): void {
    // This method is used when resolving data from route, 
    // but we also need active bookings to determine status.
    // For now, we'll re-load to ensure correct status if resolved only has basic guest data.
    // Or we could update the resolver to fetch both. 
    // Simpler to just map what we have and let loadGuests handle the full logic if needed,
    // but since resolver usually just calls service.getGuests(), we might miss active status here.
    // Let's call loadGuests() directly in ngOnInit if resolver data is insufficient, 
    // or just update this to default to checked-out until we fetch active bookings.
    // Ideally, we should fetch active bookings here too if we want to rely on resolver.

    // For now, mapping as checked-out is safe, but we'll trigger a background refresh for status
    this.guests = guests.map(g => ({
      ...g,
      totalVisits: 0,
      lastVisit: undefined,
      totalSpent: 0,
      status: 'checked-out' as const
    }));

    // Refresh status in background
    this.refreshGuestStatus();
  }

  private async refreshGuestStatus(): Promise<void> {
    try {
      const activeBookings = await this.bookingService.getActiveBookings();
      const activeBookingMap = new Map<number, Booking>();
      activeBookings.forEach(booking => {
        activeBookingMap.set(booking.guestId, booking);
      });

      this.guests = this.guests.map(guest => {
        const activeBooking = activeBookingMap.get(guest.guestId);
        if (activeBooking) {
          return {
            ...guest,
            status: 'active',
            currentRoom: activeBooking.room?.number
          };
        }
        return guest;
      });
    } catch (err) {
      console.error('Failed to refresh guest status:', err);
    }
  }

  async searchGuests(): Promise<void> {
    if (this.searchQuery.length >= 2) {
      try {
        const guests = await this.guestService.searchGuests(this.searchQuery);
        this.guests = guests.map(g => ({
          ...g,
          totalVisits: 0,
          lastVisit: undefined,
          totalSpent: 0,
          status: 'checked-out' as const
        }));
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else if (this.searchQuery.length === 0) {
      await this.loadGuests();
    }
  }

  // Stats
  get guestStats() {
    return {
      total: this.guests.length,
      inHouse: this.guests.filter(g => g.status === 'active').length,
      vip: this.guests.filter(g => (g.totalVisits || 0) >= 5).length,
      newThisMonth: 2
    };
  }

  // Filtered Guests
  get filteredGuests(): GuestDisplay[] {
    return this.guests.filter(guest => {
      const matchesStatus = this.statusFilter === 'all' || guest.status === this.statusFilter;
      const matchesSearch = !this.searchQuery ||
        guest.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        guest.mobile.includes(this.searchQuery) ||
        (guest.email?.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (guest.idNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }

  // Methods
  async openGuestDetails(guest: GuestDisplay) {
    this.selectedGuest = guest;
    this.showGuestDetailsModal = true;

    // Load guest history
    try {
      const history = await this.guestService.getGuestHistory(guest.guestId);
      this.guestHistory = history;
      // Update guest stats based on history
      if (this.selectedGuest) {
        this.selectedGuest.totalVisits = history.length;
        this.selectedGuest.totalSpent = history.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        if (history.length > 0) {
          this.selectedGuest.lastVisit = new Date(history[0].checkInTime).toISOString().split('T')[0];
        }
      }
    } catch (err) {
      console.error('Failed to load guest history:', err);
    }
  }

  closeModals() {
    this.showAddGuestModal = false;
    this.showGuestDetailsModal = false;
    this.selectedGuest = null;
    this.guestHistory = [];
  }

  async addGuest() {
    const guestData: any = {
      fullName: this.newGuest.fullName,
      mobile: this.newGuest.mobile,
      email: this.newGuest.email || null,
      idType: this.newGuest.idType,
      idNumber: this.newGuest.idNumber,
      address: this.newGuest.address || null,
      city: this.newGuest.city || null,
      country: this.newGuest.country || null
    };

    try {
      const guest = await this.guestService.createGuest(guestData);
      this.guests.push({
        ...guest,
        totalVisits: 0,
        lastVisit: undefined,
        totalSpent: 0,
        status: 'checked-out'
      });
      this.closeModals();
      this.resetForm();
    } catch (err) {
      console.error('Failed to add guest:', err);
    }
  }

  openAddChargeModal() {
    this.newCharge = { description: '', amount: 0, category: 'Service' };
    this.showAddChargeModal = true;
  }

  async saveCharge() {
    if (!this.selectedGuest || this.selectedGuest.status !== 'active') return;

    try {
      const activeBookings = await this.bookingService.getActiveBookings();
      const booking = activeBookings.find(b => b.guestId === this.selectedGuest?.guestId);

      if (booking) {
        await this.billingService.addCharge({
          bookingId: booking.bookingId,
          description: this.newCharge.description,
          amount: this.newCharge.amount,
          category: this.newCharge.category,
          date: new Date()
        });

        // We do not manually update booking.totalAmount here to avoid overwriting other booking details with defaults.
        // The CheckOut component handles the final total calculation dynamically by summing Room Charges + Additional Charges.

        alert('Charge added successfully');
        this.showAddChargeModal = false;

        // Refresh guest status local view
        if (this.selectedGuest) {
          this.selectedGuest.totalSpent = (this.selectedGuest.totalSpent || 0) + this.newCharge.amount;
        }
      } else {
        alert('Active booking not found for this guest');
      }
    } catch (err) {
      console.error('Failed to add charge:', err);
      alert('Failed to add charge');
    }
  }

  resetForm() {
    this.newGuest = {
      fullName: '',
      mobile: '',
      email: '',
      idType: 'Aadhar Card',
      idNumber: '',
      address: '',
      city: '',
      country: 'India'
    };
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isVip(guest: GuestDisplay): boolean {
    return (guest.totalVisits || 0) >= 5;
  }
}
