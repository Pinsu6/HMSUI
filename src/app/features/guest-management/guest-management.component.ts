import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestService } from '../../core/services/guest.service';
import { BookingService } from '../../core/services/booking.service';
import { Guest, Booking } from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { GuestManagementResolved } from '../../core/resolvers/guest-management.resolver';

interface GuestDisplay extends Guest {
  totalVisits?: number;
  lastVisit?: string;
  totalSpent?: number;
  status?: 'active' | 'checked-out';
  currentRoom?: string;
}

@Component({
  selector: 'app-guest-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-management.component.html',
  styleUrl: './guest-management.component.css'
})
export class GuestManagementComponent implements OnInit {
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
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['data'] as GuestManagementResolved | undefined;
    if (resolved) {
      this.setGuests(resolved.guests);
      this.loading = false;
    } else {
      this.loadGuests();
    }
  }

  async loadGuests(): Promise<void> {
    this.loading = true;

    // Static mock data - no API call
    const mockGuests: GuestDisplay[] = [
      {
        guestId: 1,
        fullName: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul.sharma@email.com',
        idType: 'Aadhar Card',
        idNumber: '1234-5678-9012',
        address: '123 MG Road',
        city: 'Mumbai',
        country: 'India',
        totalVisits: 3,
        lastVisit: '2025-12-06',
        totalSpent: 15000,
        status: 'active',
        currentRoom: '301'
      },
      {
        guestId: 2,
        fullName: 'Priya Patel',
        mobile: '9876543211',
        email: 'priya.patel@email.com',
        idType: 'Passport',
        idNumber: 'A1234567',
        address: '456 Park Street',
        city: 'Delhi',
        country: 'India',
        totalVisits: 5,
        lastVisit: '2025-12-05',
        totalSpent: 35000,
        status: 'checked-out'
      },
      {
        guestId: 3,
        fullName: 'John Smith',
        mobile: '9876543212',
        email: 'john.smith@email.com',
        idType: 'Passport',
        idNumber: 'B7654321',
        address: '789 Broadway',
        city: 'New York',
        country: 'USA',
        totalVisits: 2,
        lastVisit: '2025-12-04',
        totalSpent: 12000,
        status: 'checked-out'
      },
      {
        guestId: 4,
        fullName: 'Amit Kumar',
        mobile: '9876543213',
        email: 'amit.kumar@email.com',
        idType: 'Driving License',
        idNumber: 'DL-123456',
        address: '101 Ring Road',
        city: 'Bangalore',
        country: 'India',
        totalVisits: 1,
        lastVisit: '2025-12-08',
        totalSpent: 5000,
        status: 'active',
        currentRoom: '205'
      }
    ];

    this.guests = mockGuests;
    this.loading = false;
  }

  private setGuests(guests: Guest[]): void {
    this.guests = guests.map(g => ({
      ...g,
      totalVisits: 0,
      lastVisit: undefined,
      totalSpent: 0,
      status: 'checked-out' as const
    }));
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
