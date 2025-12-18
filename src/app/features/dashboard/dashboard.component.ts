import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';
import { DashboardStats, Booking, Room } from '../../core/models/models';
import { DashboardResolvedData } from '../../core/resolvers/dashboard.resolver';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Stats Data from API
  stats: DashboardStats = {
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    todaysCheckIns: 0,
    todaysCheckOuts: 0,
    totalGuestsInHouse: 0
  };

  // Loading state
  loading = true;

  // Occupancy Percentage
  get occupancyRate(): number {
    if (this.stats.totalRooms === 0) return 0;
    return Math.round((this.stats.occupiedRooms / this.stats.totalRooms) * 100);
  }

  // Today's Arrivals from API
  todayArrivals: Booking[] = [];

  // Today's Departures from API
  todayDepartures: Booking[] = [];

  // This Week's Bookings
  thisWeekBookings: Booking[] = [];

  // Rooms from API
  rooms: Room[] = [];

  // Active bookings for status calculation
  activeBookings: Booking[] = [];

  // Recent Activities (keeping as static for demo)
  recentActivities = [];

  // Alerts (keeping as static for demo)
  alerts = [];

  userName: string = 'User';

  constructor(
    private dashboardService: DashboardService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.userName = user.name;
      }
    });
  }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['data'] as DashboardResolvedData | undefined;
    if (resolved) {
      this.applyResolvedData(resolved);
      this.loading = false;
    } else {
      this.loadDashboardData();
    }
    // Load calendar data separately
    this.loadCalendarData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;

    try {
      // Load all data in parallel
      const [stats, checkIns, checkOuts, thisWeek, rooms, active] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getTodaysCheckIns(),
        this.dashboardService.getTodaysCheckOuts(),
        this.dashboardService.getThisWeeksBookings(),
        this.roomService.getRooms(),
        this.bookingService.getActiveBookings()
      ]);

      this.stats = stats;
      this.todayArrivals = checkIns;
      this.todayDepartures = checkOuts;
      this.thisWeekBookings = thisWeek;
      this.rooms = rooms;
      // Filter out any bookings that might have an actualCheckOutTime but are still returned as active
      this.activeBookings = (active || []).filter(b => !b.actualCheckOutTime && b.status === 'Active');

      // Recalculate room stats based on actual data
      this.calculateStats();

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.loading = false;
    }
  }

  private applyResolvedData(data: DashboardResolvedData): void {
    this.stats = data.stats;
    this.todayArrivals = data.checkIns;
    this.todayDepartures = data.checkOuts;
    this.rooms = data.rooms;
    this.thisWeekBookings = data.thisWeekBookings;

    // Filter active bookings here too
    const resolvedActive = data.activeBookings || [];
    this.activeBookings = resolvedActive.filter(b => !b.actualCheckOutTime && b.status === 'Active');

    // Recalculate room stats based on actual data
    this.calculateStats();
  }

  calculateStats() {
    this.stats.totalRooms = this.rooms.length;

    // Calculate occupied rooms based on Active Bookings, not room status
    // Get unique room IDs from active bookings
    const occupiedRoomIds = new Set(this.activeBookings.map(b => b.roomId));
    this.stats.occupiedRooms = occupiedRoomIds.size;

    this.stats.dirtyRooms = this.rooms.filter(r => r.status === 'Dirty').length;
    this.stats.maintenanceRooms = this.rooms.filter(r => r.status === 'Maintenance').length;

    // Vacant = Total - Occupied - Dirty - Maintenance
    // Ensure we don't go below zero
    const unavailable = this.stats.occupiedRooms + this.stats.dirtyRooms + this.stats.maintenanceRooms;
    this.stats.vacantRooms = Math.max(0, this.stats.totalRooms - unavailable);
  }

  getRoomStatus(room: Room): string {
    // Check if there's an active booking for this room
    const activeBooking = this.activeBookings.find(b => b.roomId === room.roomId);
    if (activeBooking) {
      return 'occupied'; // Orange color for active bookings
    }
    return room.status?.toLowerCase() || 'vacant';
  }

  getRoomGuest(room: Room): string | null {
    // Find active booking for this room
    const activeBooking = this.activeBookings.find(b => b.roomId === room.roomId);
    // Only show guest name if there's an active booking
    if (activeBooking) {
      return activeBooking.guest?.fullName || null;
    }
    return null;
  }

  // --- Calendar Logic ---
  calendarDate = new Date();
  calendarDays: any[] = [];
  allBookings: Booking[] = [];

  async loadCalendarData() {
    try {
      // Fetch all bookings (or enough for the window) to populate calendar
      // We reuse the generic getBookings which returns list
      this.allBookings = await this.bookingService.getBookings();
      this.generateCalendar();
    } catch (error) {
      console.error('Error loading calendar data', error);
    }
  }

  generateCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Days in month
    const daysInMonth = lastDay.getDate();

    // Day of week for first day (0-6)
    const startingDayOfWeek = firstDay.getDay();

    this.calendarDays = [];

    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push({ date: null, disabled: true });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const stats = this.getStatsForDate(date);
      this.calendarDays.push({
        date: i,
        fullDate: date,
        checkIns: stats.checkIns,
        checkOuts: stats.checkOuts,
        hasActivity: stats.checkIns > 0 || stats.checkOuts > 0,
        isToday: this.isToday(date)
      });
    }
  }

  getStatsForDate(date: Date): { checkIns: number, checkOuts: number } {
    let checkIns = 0;
    let checkOuts = 0;

    // Normalize date for comparison
    const target = date.toDateString();

    this.allBookings.forEach(b => {
      // Check In
      if (b.checkInTime && new Date(b.checkInTime).toDateString() === target) {
        checkIns++;
      }
      // Check Out (Expected)
      if (b.expectedCheckOutTime && new Date(b.expectedCheckOutTime).toDateString() === target) {
        checkOuts++;
      }
    });

    return { checkIns, checkOuts };
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  changeMonth(offset: number) {
    this.calendarDate = new Date(this.calendarDate.setMonth(this.calendarDate.getMonth() + offset));
    this.generateCalendar();
  }
}
