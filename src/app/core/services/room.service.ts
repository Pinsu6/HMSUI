import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room, RoomType } from '../models/models';
import { BookingService } from './booking.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private bookingService: BookingService) { }

  // Room Types
  async getRoomTypes(): Promise<RoomType[]> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      typeId: 0,
      name: '',
      baseRate: 0,
      maxGuests: 0,
      amenities: ''
    };

    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/RoomType/get`, payload));
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          typeId: item.TypeId,
          name: item.Name,
          baseRate: item.BaseRate,
          maxGuests: item.MaxGuests,
          description: item.Amenities || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      return [];
    }
  }

  async getRoomType(id: number): Promise<RoomType> {
    return await firstValueFrom(this.http.get<RoomType>(`${this.apiUrl}/roomtypes/${id}`));
  }

  async createRoomType(roomType: RoomType): Promise<RoomType> {
    return await firstValueFrom(this.http.post<RoomType>(`${this.apiUrl}/roomtypes`, roomType));
  }

  async updateRoomType(id: number, roomType: RoomType): Promise<void> {
    return await firstValueFrom(this.http.put<void>(`${this.apiUrl}/roomtypes/${id}`, roomType));
  }

  async deleteRoomType(id: number): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/roomtypes/${id}`));
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      roomId: 0,
      roomNumber: '',
      roomTypeId: 0,
      price: 0,
      status: '',
      description: ''
    };
    const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Room/get`, payload));
    // Parse responseData if it exists
    const data = response.responseData ? JSON.parse(response.responseData) : response;

    // Map PascalCase API response to camelCase Room model
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        roomId: item.RoomId,
        number: item.Number,
        floor: item.Floor || 1,
        typeId: item.TypeId,
        status: item.Status,
        roomType: {
          typeId: item.TypeId,
          name: item.RoomTypeName,
          baseRate: item.BaseRate,
          maxGuests: item.MaxGuests,
          description: item.Amenities || ''
        }
      }));
    }
    return [];
  }

  async getAvailableRooms(): Promise<Room[]> {
    // Get rooms and active bookings in parallel
    const [allRooms, activeBookings] = await Promise.all([
      this.getRooms(),
      this.bookingService.getActiveBookings()
    ]);

    const occupiedRoomIds = new Set(activeBookings.map(b => b.roomId));

    return allRooms.filter(room => {
      const status = (room.status || '').toLowerCase();

      // If the room has an active booking, it's definitely occupied
      if (occupiedRoomIds.has(room.roomId)) {
        return false;
      }

      // If no active booking, check if it's explicitly unavailable (Dirty/Maintenance)
      // We allow 'Occupied' status here if there is no active booking, assuming the status is stale/out-of-sync
      if (status === 'dirty' || status === 'maintenance') {
        return false;
      }

      return true;
    });
  }

  async getRoom(id: number): Promise<Room> {
    return await firstValueFrom(this.http.get<Room>(`${this.apiUrl}/rooms/${id}`));
  }

  async createRoom(room: { number: string; floor: number; typeId: number; status: string }): Promise<Room> {
    // Use insertUpdateRoom API
    const response = await this.insertUpdateRoom({
      roomId: 0,
      roomNumber: room.number,
      roomTypeId: room.typeId,
      status: room.status,
      price: 0,
      description: ''
    });

    console.log('createRoom API response:', response);

    let roomId = 0;
    let responseData: any = null;

    // Parse response and extract roomId
    if (response.responseData) {
      try {
        const data = JSON.parse(response.responseData);
        console.log('Parsed responseData:', data);

        if (Array.isArray(data) && data.length > 0) {
          responseData = data[0];
          roomId = responseData.RoomId || responseData.roomId || 0;
        } else if (typeof data === 'object') {
          responseData = data;
          roomId = responseData.RoomId || responseData.roomId || 0;
        }
      } catch (e) {
        console.error('Failed to parse responseData:', e);
      }
    } else if (response.RoomId || response.roomId) {
      roomId = response.RoomId || response.roomId;
    }

    console.log('Extracted roomId:', roomId);

    // Return room with all fields - use responseData if available, otherwise use input data
    const result: Room = {
      roomId: roomId,
      number: responseData?.Number || responseData?.RoomNumber || room.number,
      floor: responseData?.Floor || room.floor,
      typeId: responseData?.TypeId || responseData?.RoomTypeId || room.typeId,
      status: (responseData?.Status || room.status) as 'Vacant' | 'Occupied' | 'Dirty' | 'Maintenance'
    };

    console.log('createRoom final result:', result);
    return result;
  }

  async insertUpdateRoom(roomData: {
    roomId?: number;
    roomNumber: string;
    roomTypeId: number;
    price?: number;
    status?: string;
    description?: string;
  }): Promise<any> {
    const payload = {
      page: 0,
      pageSize: 0,
      sortColumn: '',
      sortDirection: '',
      searchText: '',
      roomId: roomData.roomId || 0,
      roomNumber: roomData.roomNumber,
      roomTypeId: roomData.roomTypeId,
      price: roomData.price || 0,
      status: roomData.status || 'Vacant',
      description: roomData.description || ''
    };
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Room/insertupdate`, payload));
  }

  async updateRoomStatus(id: number, status: string): Promise<void> {
    // Use insertUpdateRoom to update status
    await this.insertUpdateRoom({
      roomId: id,
      roomNumber: '',
      roomTypeId: 0,
      status: status
    });
  }

  async deleteRoom(id: number): Promise<void> {
    console.warn('Delete room not implemented - requires separate API endpoint');
    return Promise.resolve();
  }

  // Mark room as clean using dedicated API
  async markClean(roomId: number): Promise<any> {
    const payload = {
      roomId: roomId
    };
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Room/markclean`, payload));
  }
}
