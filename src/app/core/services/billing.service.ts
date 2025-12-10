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
    return await firstValueFrom(this.http.get<Charge[]>(`${this.apiUrl}/charges/booking/${bookingId}`));
  }

  async addCharge(charge: Partial<Charge>): Promise<Charge> {
    return await firstValueFrom(this.http.post<Charge>(`${this.apiUrl}/charges`, charge));
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
