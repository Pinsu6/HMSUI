import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WiFiLog } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class WiFiLogService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async getLogs(): Promise<WiFiLog[]> {
    return await firstValueFrom(this.http.get<WiFiLog[]>(`${this.apiUrl}/WiFiLogs`));
  }
}
