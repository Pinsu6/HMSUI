import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { SettingsService } from '../../core/services/settings.service';
import { Booking } from '../../core/models/models';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.css'
})
export class BookingManagementComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.loadBookings();

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadBookings();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadBookings() {
    this.loading = true;
    this.cdr.detectChanges(); // Force check after setting loading to true

    try {
      // Use server-side search and sorting for better performance
      this.bookings = await this.bookingService.getBookings({
        searchText: this.searchTerm,
        pageSize: 50, // Load a reasonable amount first
        sortColumn: 'BookingId',
        sortDirection: 'DESC'
      });
      this.filteredBookings = this.bookings;
    } catch (error) {
      console.error('Error loading bookings', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force check after setting loading to false
    }
  }

  filterBookings() {
    // Trigger server-side search via subject
    this.searchSubject.next(this.searchTerm);
  }

  viewCustomerInfo(booking: Booking) {
    this.router.navigate(['/bookings', booking.bookingId]);
  }
}
