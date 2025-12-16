import { Injectable } from '@angular/core';

export interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timezone: string;
}

export interface TaxSettings {
  enableGst: boolean;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
}

const HOTEL_SETTINGS_KEY = 'hotelSettings';
const TAX_SETTINGS_KEY = 'taxSettings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Default Hotel Settings
  private defaultHotelSettings: HotelSettings = {
    name: 'Grand Palace Hotel',
    address: '123 Hotel Street, City, State - 123456',
    phone: '+91 12345 67890',
    email: 'info@grandpalace.com',
    website: 'www.grandpalace.com',
    gstin: '12ABCDE3456F7Z8',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  };

  // Default Tax Settings
  private defaultTaxSettings: TaxSettings = {
    enableGst: true,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    enableServiceCharge: false,
    serviceChargeRate: 10
  };

  constructor() { }

  // Get Hotel Settings from localStorage
  getHotelSettings(): HotelSettings {
    const stored = localStorage.getItem(HOTEL_SETTINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.defaultHotelSettings;
      }
    }
    return this.defaultHotelSettings;
  }

  // Save Hotel Settings to localStorage
  saveHotelSettings(settings: HotelSettings): void {
    localStorage.setItem(HOTEL_SETTINGS_KEY, JSON.stringify(settings));
  }

  // Get Tax Settings from localStorage
  getTaxSettings(): TaxSettings {
    const stored = localStorage.getItem(TAX_SETTINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.defaultTaxSettings;
      }
    }
    return this.defaultTaxSettings;
  }

  // Save Tax Settings to localStorage
  saveTaxSettings(settings: TaxSettings): void {
    localStorage.setItem(TAX_SETTINGS_KEY, JSON.stringify(settings));
  }

  // Quick access methods
  getDefaultCheckOutTime(): string {
    return this.getHotelSettings().checkOutTime;
  }

  getDefaultCheckInTime(): string {
    return this.getHotelSettings().checkInTime;
  }

  getDefaultCurrency(): string {
    return this.getHotelSettings().currency;
  }

  getHotelName(): string {
    return this.getHotelSettings().name;
  }
}
