import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RoomTypeDto {
  typeId?: number;
  name: string;
  baseRate: number;
  maxGuests: number;
  amenities: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private apiUrl = `${environment.apiUrl}/RoomType`;

  constructor(private http: HttpClient) { }

  // Insert or Update Room Type
  async insertUpdateRoomType(roomType: RoomTypeDto): Promise<any> {
    const payload = {
      typeId: roomType.typeId || 0,
      name: roomType.name,
      baseRate: roomType.baseRate,
      maxGuests: roomType.maxGuests,
      amenities: roomType.amenities || ''
    };

    return await firstValueFrom(this.http.post(`${this.apiUrl}/insertupdate`, payload));
  }

  // Get all room types
  async getRoomTypes(): Promise<RoomTypeDto[]> {
    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/get`, {}));

      console.log('GetRoomTypes raw response:', response);

      // Parse responseData if it exists (API returns data as JSON string)
      let data = response;
      if (response.responseData) {
        data = JSON.parse(response.responseData);
      }

      console.log('GetRoomTypes parsed data:', data);

      // Map PascalCase API response to camelCase RoomTypeDto
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          typeId: item.TypeId || item.typeId,
          name: item.Name || item.name || '',
          baseRate: item.BaseRate || item.baseRate || 0,
          maxGuests: item.MaxGuests || item.maxGuests || 1,
          amenities: item.Amenities || item.amenities || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      return [];
    }
  }

  // Delete room type
  async deleteRoomType(typeId: number): Promise<any> {
    const payload = { typeId: typeId };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/delete`, payload));
  }
}
