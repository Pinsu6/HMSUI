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

  private mapBooking(item: any): Booking {
    return {
      bookingId: item.BookingId || item.bookingId,
      guestId: item.GuestId || item.guestId,
      roomId: item.RoomId || item.roomId,
      checkInTime: new Date(item.CheckInTime || item.checkInTime),
      expectedCheckOutTime: new Date(item.ExpectedCheckOutTime || item.expectedCheckOutTime),
      actualCheckOutTime: (item.ActualCheckOutTime || item.actualCheckOutTime) ? new Date(item.ActualCheckOutTime || item.actualCheckOutTime) : undefined,
      adults: item.Adults || item.adults,
      children: item.Children || item.children,
      status: item.Status || item.status,
      totalAmount: item.TotalAmount || item.totalAmount,
      taxAmount: item.TaxAmount || item.taxAmount,
      guest: {
        guestId: item.GuestId || item.guestId,
        fullName: item.GuestName || item.FullName || item.fullName || 'Unknown',
        mobile: item.Mobile || item.mobile || '',
        email: item.Email || item.email || '',
        idType: item.IdType || item.idType || '',
        idNumber: item.IdNumber || item.idNumber || '',
        city: item.City || item.city || '',
        country: item.Country || item.country || ''
      },
      room: {
        roomId: item.RoomId || item.roomId,
        number: item.RoomNo || item.RoomNumber || item.roomNumber || 'N/A',
        floor: item.FloorNo || item.floorNo || 1,
        typeId: item.RoomTypeId || item.typeId || 1,
        status: item.RoomStatus || item.status || 'Occupied',
        roomType: {
          name: item.RoomTypeName || (item.roomType && item.roomType.name) || 'Standard',
          typeId: item.RoomTypeId || item.typeId || 1,
          baseRate: 0,
          maxGuests: 0
        }
      }
    };
  }

  async getBookings(options: {
    searchText?: string,
    pageSize?: number,
    page?: number,
    sortColumn?: string,
    sortDirection?: string,
    status?: string
  } = {}): Promise<Booking[]> {
    const payload = {
      page: options.page || 0,
      pageSize: options.pageSize || 100, // Default to 100 to avoid loading too much
      sortColumn: options.sortColumn || 'BookingId',
      sortDirection: options.sortDirection || 'DESC',
      searchText: options.searchText || '',
      bookingId: 0,
      guestId: 0,
      roomId: 0,
      checkInTime: null,
      expectedCheckOutTime: null,
      actualCheckOutTime: null,
      adults: 0,
      children: 0,
      status: options.status || '',
      totalAmount: 0,
      taxAmount: 0
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Booking/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        return data.map(item => this.mapBooking(item));
      }
    } catch (error) {
      console.error('Error fetching bookings', error);
    }
    return [];
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return this.getBookings({ status });
  }

  async getActiveBookings(): Promise<Booking[]> {
    const bookings = await this.getBookings({ status: 'Active', pageSize: 0 }); // pageSize 0 to get all active for dashboard logic
    return bookings.filter(b => !b.actualCheckOutTime);
  }

  async getBooking(id: number): Promise<Booking | null> {
    const payload = {
      page: 0,
      pageSize: 1,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      bookingId: id,
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

      if (Array.isArray(data) && data.length > 0) {
        return this.mapBooking(data[0]);
      }
    } catch (error) {
      console.error('Error fetching booking by ID', error);
    }
    return null;
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
