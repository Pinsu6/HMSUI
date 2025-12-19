import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Charge, Payment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Charges
  async getChargesByBooking(bookingId: number): Promise<Charge[]> {
    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Charge/Get`, { bookingId }));
      const data = response.responseData ? JSON.parse(response.responseData) : response;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      return [];
    }
  }

  async addCharge(charge: Partial<Charge>): Promise<Charge> {
    // Assuming InsertUpdate pattern too given "hum post use karte hai"
    const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Charge/InsertUpdate`, charge));
    return response.responseData ? JSON.parse(response.responseData) : response;
  }

  async deleteCharge(id: number): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/charges/${id}`));
  }

  // Payments
  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await firstValueFrom(this.http.get<Payment[]>(`${this.apiUrl}/payments/booking/${bookingId}`));
  }

  async addPayment(payment: Partial<Payment>): Promise<Payment> {
    return await firstValueFrom(this.http.post<Payment>(`${this.apiUrl}/payments`, payment));
  }
}
