import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, Booking } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async getStats(): Promise<DashboardStats> {
    const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Dashboard/GetDashboardSummary`, { userId: 0 }));

    // Parse the inner JSON string if responseData exists
    const data = response.responseData ? JSON.parse(response.responseData) : response;

    return {
      totalRooms: data.TotalRooms || 0,
      occupiedRooms: data.OccupiedRooms || 0,
      vacantRooms: data.VacantRooms || 0,
      dirtyRooms: data.RoomsToClean || 0,
      maintenanceRooms: data.MaintenanceRooms || 0, // Fallback if not in API
      todaysCheckIns: data.TodayCheckIns || 0,
      todaysCheckOuts: data.TodayCheckOuts || 0,
      totalGuestsInHouse: data.GuestsInHouse || 0
    };
  }

  async getTodaysCheckIns(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      bookingId: 0,
      guestId: 0,
      roomId: 0,
      checkInTime: today.toISOString(),
      expectedCheckOutTime: null,
      actualCheckOutTime: null,
      adults: 0,
      children: 0,
      status: 'Active',
      totalAmount: 0,
      taxAmount: 0
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        // Filter to only include bookings where checkInTime is TODAY
        const todayStart = today.getTime();
        const tomorrowStart = tomorrow.getTime();

        return data
          .filter((item: any) => {
            const checkInDate = new Date(item.CheckInTime);
            // checkInDate.setHours(0,0,0,0); // Optional: if we want to ignore time part comparison strictly
            const time = checkInDate.getTime();
            return time >= todayStart && time < tomorrowStart;
          })
          .map((item: any) => ({
            bookingId: item.BookingId,
            guestId: item.GuestId,
            roomId: item.RoomId,
            checkInTime: new Date(item.CheckInTime),
            expectedCheckOutTime: new Date(item.ExpectedCheckOutTime),
            actualCheckOutTime: item.ActualCheckOutTime ? new Date(item.ActualCheckOutTime) : undefined,
            adults: item.Adults,
            children: item.Children,
            status: item.Status,
            totalAmount: item.TotalAmount,
            taxAmount: item.TaxAmount,
            guest: {
              guestId: item.GuestId,
              fullName: item.GuestName,
              mobile: ''
            },
            room: {
              roomId: item.RoomId,
              number: item.RoomNo,
              floor: 1,
              typeId: 1,
              status: 'Occupied' as const
            }
          }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch today\'s check-ins:', error);
      return [];
    }
  }

  async getTodaysCheckOuts(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch bookings to filter client side for better accuracy on "Active today" vs "Departed today"
    // We remove expectedCheckOutTime filter from server to get a broader range, 
    // ensuring we catch early checkouts that happened today.
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      bookingId: 0,
      guestId: 0,
      roomId: 0,
      checkInTime: null,
      expectedCheckOutTime: null,
      actualCheckOutTime: null,
      adults: 0,
      children: 0,
      status: '', // Empty status to get both Active and Completed bookings
      totalAmount: 0,
      taxAmount: 0
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        const todayStart = today.getTime();
        const tomorrowStart = tomorrow.getTime();

        return data
          .filter((item: any) => {
            const expectedCheckOut = item.ExpectedCheckOutTime ? new Date(item.ExpectedCheckOutTime).getTime() : 0;
            const actualCheckOut = item.ActualCheckOutTime ? new Date(item.ActualCheckOutTime).getTime() : 0;

            // 1. Actually Checked Out TODAY
            const checkedOutToday = actualCheckOut >= todayStart && actualCheckOut < tomorrowStart;

            // 2. Expected to Check Out TODAY (and hasn't checked out yet)
            // We check !ActualCheckOutTime to ensure we don't double count or show "Expected Today" if they left "Yesterday" (which shouldn't happen but good to be safe)
            const expectedTodayAndActive = !item.ActualCheckOutTime && (expectedCheckOut >= todayStart && expectedCheckOut < tomorrowStart);

            return checkedOutToday || expectedTodayAndActive;
          })
          .map((item: any) => ({
            bookingId: item.BookingId,
            guestId: item.GuestId,
            roomId: item.RoomId,
            checkInTime: new Date(item.CheckInTime),
            expectedCheckOutTime: new Date(item.ExpectedCheckOutTime),
            actualCheckOutTime: item.ActualCheckOutTime ? new Date(item.ActualCheckOutTime) : undefined,
            adults: item.Adults,
            children: item.Children,
            status: item.Status,
            totalAmount: item.TotalAmount,
            taxAmount: item.TaxAmount,
            guest: {
              guestId: item.GuestId,
              fullName: item.GuestName,
              mobile: ''
            },
            room: {
              roomId: item.RoomId,
              number: item.RoomNo,
              floor: 1,
              typeId: 1,
              status: 'Occupied' as const
            }
          }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch today\'s check-outs:', error);
      return [];
    }
  }

  async getThisWeeksBookings(): Promise<Booking[]> {
    const today = new Date();
    // Get start of week (Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const payload = {
      page: 0,
      pageSize: 0, // Get all to filter client side
      sortColumn: 'CheckInTime',
      sortDirection: 'ASC',
      searchText: '',
      bookingId: 0,
      guestId: 0,
      roomId: 0,
      checkInTime: null,
      expectedCheckOutTime: null,
      actualCheckOutTime: null,
      adults: 0,
      children: 0,
      status: '',
      totalAmount: 0,
      taxAmount: 0
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        const weekStart = monday.getTime();
        const weekEnd = sunday.getTime();

        return data
          .filter((item: any) => {
            if (!item.CheckInTime) return false;
            const checkInDate = new Date(item.CheckInTime).getTime();
            return checkInDate >= weekStart && checkInDate <= weekEnd;
          })
          .map((item: any) => ({
            bookingId: item.BookingId,
            guestId: item.GuestId,
            roomId: item.RoomId,
            checkInTime: new Date(item.CheckInTime),
            expectedCheckOutTime: new Date(item.ExpectedCheckOutTime),
            actualCheckOutTime: item.ActualCheckOutTime ? new Date(item.ActualCheckOutTime) : undefined,
            adults: item.Adults,
            children: item.Children,
            status: item.Status,
            totalAmount: item.TotalAmount,
            taxAmount: item.TaxAmount,
            guest: {
              guestId: item.GuestId,
              fullName: item.GuestName,
              mobile: ''
            },
            room: {
              roomId: item.RoomId,
              number: item.RoomNo,
              floor: 1,
              typeId: 1,
              status: 'Occupied' as const
            }
          }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch this week bookings:', error);
      return [];
    }
  }
}
