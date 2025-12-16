import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrencyDto {
  currencyId?: number;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  createdOn?: string;
  updatedOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = `${environment.apiUrl}/Currency`;

  constructor(private http: HttpClient) { }

  // Insert or Update Currency
  async insertUpdateCurrency(currency: CurrencyDto): Promise<any> {
    const payload = {
      currencyId: currency.currencyId || 0,
      currencyCode: currency.currencyCode,
      currencyName: currency.currencyName,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
      isActive: currency.isActive,
      createdOn: currency.createdOn || new Date().toISOString(),
      updatedOn: new Date().toISOString()
    };

    return await firstValueFrom(this.http.post(`${this.apiUrl}/InsertUpdateCurrency`, payload));
  }

  // Get all currencies
  async getCurrencies(): Promise<CurrencyDto[]> {
    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/GetCurrencies`, {}));

      console.log('GetCurrencies raw response:', response);

      // Parse responseData if it exists (API returns data as JSON string)
      let data = response;
      if (response.responseData) {
        data = JSON.parse(response.responseData);
      }

      console.log('GetCurrencies parsed data:', data);

      // Map PascalCase API response to camelCase CurrencyDto
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          currencyId: item.CurrencyId || item.currencyId,
          currencyCode: item.CurrencyCode || item.currencyCode || '',
          currencyName: item.CurrencyName || item.currencyName || '',
          symbol: item.Symbol || item.symbol || '',
          exchangeRate: item.ExchangeRate || item.exchangeRate || 0,
          isActive: item.IsActive !== undefined ? item.IsActive : (item.isActive !== undefined ? item.isActive : true),
          createdOn: item.CreatedOn || item.createdOn,
          updatedOn: item.UpdatedOn || item.updatedOn
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      return [];
    }
  }

  // Delete currency
  async deleteCurrency(currencyId: number): Promise<any> {
    const payload = { currencyId: currencyId };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/DeleteCurrency`, payload));
  }
}
