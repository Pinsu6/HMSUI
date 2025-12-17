import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  bookingId: number;
  roomId: number;
  roomNumber: string;
  guestName: string;
  notificationType: 'TODAY_CHECKOUT' | 'CLEANING_PENDING' | 'OVERDUE_CHECKOUT';
  notificationMessage: string;
  expectedCheckOutTime: string;
  actualCheckOutTime?: string;
  isRead: boolean;
}

export interface NotificationResponse {
  status: string;
  type: string;
  totalCount: number;
  message: string;
  responseData: string; // JSON string of NotificationItem[]
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      // The SP expects @pJsonData but typically GET requests don't have bodies. 
      // The user URL is .../Notification/get, which implies a GET or a POST with empty body.
      // Looking at the SP, it allows @pJsonData but doesn't seem to force it for filtering (it checks ISNULL(B.IsRead,0)=0).
      // However, typical pattern here (based on other services) seems to be POSTing to a 'get' endpoint with search params.
      // But the user specific URL is `https://localhost:44363/api/Notification/get`. 
      // I'll try a POST first as that's the pattern in BookingService (Booking/get).
      // If it fails, I'll switch to GET.

      const response = await firstValueFrom(this.http.post<NotificationResponse>(`${this.apiUrl}/Notification/get`, {}));

      if (response && response.responseData) {
        const data = JSON.parse(response.responseData);
        if (Array.isArray(data)) {
          return data.map((item: any) => ({
            bookingId: item.BookingId,
            roomId: item.RoomId,
            roomNumber: item.RoomNumber,
            guestName: item.GuestName,
            notificationType: item.NotificationType,
            notificationMessage: item.NotificationMessage,
            expectedCheckOutTime: item.ExpectedCheckOutTime,
            actualCheckOutTime: item.ActualCheckOutTime,
            isRead: item.IsRead
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(bookingId: number): Promise<any> {
    const payload = {
      page: 0,
      pageSize: 0,
      bookingId: bookingId,
      guestId: 0,
      roomId: 0, // Default
      checkInTime: new Date().toISOString(),
      expectedCheckOutTime: new Date().toISOString(),
      actualCheckOutTime: new Date().toISOString(),
      adults: 0,
      children: 0,
      status: '',
      totalAmount: 0,
      taxAmount: 0
    };

    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Notification/markread`, payload));
  }
}
