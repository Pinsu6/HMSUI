import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CheckInDto, CheckOutDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async getBookings(): Promise<Booking[]> {
    return this.getBookingsByStatus('');
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
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
      status: status,
      totalAmount: 0,
      taxAmount: 0
    };
    const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/get`, payload));
    const data = response.responseData ? JSON.parse(response.responseData) : response;

    // Map PascalCase API response to camelCase model
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
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
  }

  async getActiveBookings(): Promise<Booking[]> {
    const bookings = await this.getBookingsByStatus('Active');
    // Filter out bookings that have actually checked out (ActualCheckOutTime is present)
    return bookings.filter(b => !b.actualCheckOutTime);
  }

  async getBooking(id: number): Promise<Booking> {
    return await firstValueFrom(this.http.get<Booking>(`${this.apiUrl}/bookings/${id}`));
  }

  async checkIn(dto: CheckInDto): Promise<Booking> {
    return await firstValueFrom(this.http.post<Booking>(`${this.apiUrl}/bookings/checkin`, dto));
  }

  async checkOut(bookingId: number, dto: CheckOutDto): Promise<any> {
    const payload = {
      bookingId: bookingId,
      ...dto
    };
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/checkout`, payload));
  }

  // Insert or Update Booking via new API
  async insertUpdateBooking(bookingData: {
    bookingId?: number;
    guestId: number;
    roomId: number;
    checkInTime?: string;
    expectedCheckOutTime?: string;
    actualCheckOutTime?: string;
    adults?: number;
    children?: number;
    status?: string;
    totalAmount?: number;
    taxAmount?: number;
  }): Promise<any> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      bookingId: bookingData.bookingId || 0,
      guestId: bookingData.guestId,
      roomId: bookingData.roomId,
      checkInTime: bookingData.checkInTime || new Date().toISOString(),
      expectedCheckOutTime: bookingData.expectedCheckOutTime || new Date().toISOString(),
      actualCheckOutTime: bookingData.actualCheckOutTime || null,
      adults: bookingData.adults || 1,
      children: bookingData.children || 0,
      status: bookingData.status || 'Active',
      totalAmount: bookingData.totalAmount || 0,
      taxAmount: bookingData.taxAmount || 0
    };
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/insertupdate`, payload));
  }
}
