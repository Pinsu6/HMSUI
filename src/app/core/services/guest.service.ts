import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Guest, Booking } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async getGuests(): Promise<Guest[]> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      guestId: 0,
      fullName: '',
      mobile: '',
      email: '',
      idType: '',
      idNumber: '',
      address: '',
      city: '',
      country: ''
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Guest/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          guestId: item.GuestId,
          fullName: item.FullName,
          mobile: item.Mobile,
          email: item.Email || '',
          idType: item.IdType,
          idNumber: item.IdNumber,
          address: item.Address,
          city: item.City,
          country: item.Country
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      return [];
    }
  }

  async getGuest(id: number): Promise<Guest> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      guestId: id,
      fullName: '',
      mobile: '',
      email: '',
      idType: '',
      idNumber: '',
      address: '',
      city: '',
      country: ''
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Guest/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          guestId: item.GuestId,
          fullName: item.FullName,
          mobile: item.Mobile,
          email: item.Email || '',
          idType: item.IdType,
          idNumber: item.IdNumber,
          address: item.Address,
          city: item.City,
          country: item.Country
        };
      }
      throw new Error('Guest not found');
    } catch (error) {
      console.error('Failed to fetch guest:', error);
      throw error;
    }
  }

  async searchGuests(query: string): Promise<Guest[]> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: query,
      guestId: 0,
      fullName: '',
      mobile: '',
      email: '',
      idType: '',
      idNumber: '',
      address: '',
      city: '',
      country: ''
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Guest/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          guestId: item.GuestId,
          fullName: item.FullName,
          mobile: item.Mobile,
          email: item.Email || '',
          idType: item.IdType,
          idNumber: item.IdNumber,
          address: item.Address,
          city: item.City,
          country: item.Country
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to search guests:', error);
      return [];
    }
  }

  async getGuestHistory(id: number): Promise<Booking[]> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      bookingId: 0,
      guestId: id,
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
    } catch (error) {
      console.error('Failed to fetch guest history:', error);
      return [];
    }
  }

  async createGuest(guest: Guest): Promise<Guest> {
    return await this.insertUpdateGuest({
      guestId: 0,
      fullName: guest.fullName,
      mobile: guest.mobile,
      email: guest.email,
      idType: guest.idType,
      idNumber: guest.idNumber,
      address: guest.address,
      city: guest.city,
      country: guest.country
    });
  }

  async updateGuest(id: number, guest: Guest): Promise<void> {
    await this.insertUpdateGuest({
      guestId: id,
      fullName: guest.fullName,
      mobile: guest.mobile,
      email: guest.email,
      idType: guest.idType,
      idNumber: guest.idNumber,
      address: guest.address,
      city: guest.city,
      country: guest.country
    });
  }

  async deleteGuest(id: number): Promise<void> {
    // Note: Delete functionality would need a separate API endpoint
    // For now, logging a warning
    console.warn('Delete guest not implemented - requires separate API endpoint');
    return Promise.resolve();
  }

  // Insert or Update Guest via new API
  async insertUpdateGuest(guestData: {
    sortColumn?: string;
    sortDirection?: string;
    searchText?: string;
    guestId?: number;
    fullName: string;
    mobile: string;
    email?: string;
    idType?: string;
    idNumber?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Promise<any> {
    const payload = {
      sortColumn: guestData.sortColumn || '',
      sortDirection: guestData.sortDirection || '',
      searchText: guestData.searchText || '',
      guestId: guestData.guestId || 0,
      fullName: guestData.fullName,
      mobile: guestData.mobile,
      email: guestData.email || '',
      idType: guestData.idType || '',
      idNumber: guestData.idNumber || '',
      address: guestData.address || '',
      city: guestData.city || '',
      country: guestData.country || ''
    };
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Guest/insertupdate`, payload));
  }
}
