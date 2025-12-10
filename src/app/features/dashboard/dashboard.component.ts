import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { RoomService } from '../../core/services/room.service';
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

  // Rooms from API
  rooms: Room[] = [];

  // Recent Activities (keeping as static for demo)
  recentActivities = [];

  // Alerts (keeping as static for demo)
  alerts = [];

  userName: string = 'User';

  constructor(
    private dashboardService: DashboardService,
    private roomService: RoomService,
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
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;

    try {
      // Load all data in parallel
      const [stats, checkIns, checkOuts, rooms] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getTodaysCheckIns(),
        this.dashboardService.getTodaysCheckOuts(),
        this.roomService.getRooms()
      ]);

      this.stats = stats;
      this.todayArrivals = checkIns;
      this.todayDepartures = checkOuts;
      this.rooms = rooms;
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
  }

  getRoomStatus(room: Room): string {
    // Check if there's an active booking for this room
    const activeBooking = this.todayArrivals.find(b => b.roomId === room.roomId && b.status === 'Active');
    if (activeBooking) {
      return 'occupied'; // Orange color for active bookings
    }
    return room.status?.toLowerCase() || 'vacant';
  }

  getRoomGuest(room: Room): string | null {
    // Find active booking for this room
    const activeBooking = this.todayArrivals.find(b => b.roomId === room.roomId && b.status === 'Active');
    // Only show guest name if there's an active booking
    if (activeBooking) {
      return activeBooking.guest?.fullName || null;
    }
    return null;
  }
}
