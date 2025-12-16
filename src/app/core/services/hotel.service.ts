import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface HotelInformationDto {
  hotelId?: number;
  hotelName?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  address?: string;
  gstin?: string;
}

interface ApiResponse<T> {
  statusCode?: number;
  statusMessage?: string;
  status?: string;  // For responses using 'success' instead of statusCode
  message?: string; // For responses using 'message' instead of statusMessage
  responseData?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = environment.apiUrl;

  constructor() { }

  // Get Hotel Information
  async getHotelInformation(): Promise<HotelInformationDto> {
    try {
      const response = await fetch(`${this.apiUrl}/Hotel/GetHotelInformation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotel information');
      }

      const result: ApiResponse<any> = await response.json();

      // Parse responseData if it's a string
      let hotelData: any = {};
      if (result.responseData) {
        const parsed = JSON.parse(result.responseData);
        // Handle array or single object
        if (Array.isArray(parsed) && parsed.length > 0) {
          hotelData = parsed[0];
        } else {
          hotelData = parsed;
        }
      } else if (result.data) {
        hotelData = Array.isArray(result.data) ? result.data[0] : result.data;
      }

      // Map PascalCase to camelCase
      return {
        hotelId: hotelData.HotelId || hotelData.hotelId,
        hotelName: hotelData.HotelName || hotelData.hotelName,
        email: hotelData.Email || hotelData.email,
        phoneNumber: hotelData.PhoneNumber || hotelData.phoneNumber,
        website: hotelData.Website || hotelData.website,
        address: hotelData.Address || hotelData.address,
        gstin: hotelData.GSTIN || hotelData.gstin
      };
    } catch (error) {
      console.error('Error fetching hotel information:', error);
      throw error;
    }
  }

  // Insert/Update Hotel Information
  async insertUpdateHotelInformation(hotel: HotelInformationDto): Promise<void> {
    try {
      const requestBody = {
        HotelId: hotel.hotelId || 0,
        HotelName: hotel.hotelName,
        Email: hotel.email,
        PhoneNumber: hotel.phoneNumber,
        Website: hotel.website,
        Address: hotel.address,
        GSTIN: hotel.gstin
      };

      const response = await fetch(`${this.apiUrl}/Hotel/InsertUpdateHotelInformation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to update hotel information: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<any> = await response.json();

      // Check for success using either statusCode or status field
      const isSuccess = result.statusCode === 200 || result.status === 'success';

      if (!isSuccess) {
        throw new Error(result.statusMessage || result.message || 'Failed to update hotel information');
      }
    } catch (error) {
      console.error('Error updating hotel information:', error);
      throw error;
    }
  }
}
