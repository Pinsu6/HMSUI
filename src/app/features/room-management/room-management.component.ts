import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';
import { Room, RoomType } from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { RoomManagementResolved } from '../../core/resolvers/room-management.resolver';

@Component({
  selector: 'app-room-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-management.component.html',
  styleUrl: './room-management.component.css'
})
export class RoomManagementComponent implements OnInit {
  // View Mode
  viewMode: 'grid' | 'list' = 'grid';

  // Filters
  statusFilter = 'all';
  typeFilter = 'all';
  floorFilter = 'all';
  searchQuery = '';

  // Loading state
  loading = false;

  // Modal States
  showAddRoomModal = false;
  showRoomDetailsModal = false;
  showAddTypeModal = false;
  selectedRoom: Room | null = null;

  // Room Types from API
  roomTypes: RoomType[] = [];

  // Rooms from API
  rooms: Room[] = [];

  // New Room Form
  newRoom = {
    number: '',
    floor: 1,
    typeId: 0,
    status: 'Vacant' as const
  };

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['data'] as RoomManagementResolved | undefined;
    if (resolved) {
      this.applyResolved(resolved);
      this.loading = false;
    } else {
      this.loadData();
    }
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const [types, rooms] = await Promise.all([
        this.roomService.getRoomTypes(),
        this.roomService.getRooms()
      ]);

      this.roomTypes = types;
      if (types.length > 0) {
        this.newRoom.typeId = types[0].typeId;
      }
      this.rooms = rooms;
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private applyResolved(resolved: RoomManagementResolved) {
    this.roomTypes = resolved.types;
    if (resolved.types.length > 0) {
      this.newRoom.typeId = resolved.types[0].typeId;
    }
    this.rooms = resolved.rooms;
  }

  // Stats
  get roomStats() {
    return {
      total: this.rooms.length,
      vacant: this.rooms.filter(r => r.status === 'Vacant').length,
      occupied: this.rooms.filter(r => r.status === 'Occupied').length,
      dirty: this.rooms.filter(r => r.status === 'Dirty').length,
      maintenance: this.rooms.filter(r => r.status === 'Maintenance').length
    };
  }

  // Filtered Rooms
  get filteredRooms(): Room[] {
    return this.rooms.filter(room => {
      const matchesStatus = this.statusFilter === 'all' || room.status.toLowerCase() === this.statusFilter;
      const matchesType = this.typeFilter === 'all' || room.roomType?.name === this.typeFilter;
      const matchesFloor = this.floorFilter === 'all' || room.floor === parseInt(this.floorFilter);
      const matchesSearch = !this.searchQuery ||
        room.number.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesStatus && matchesType && matchesFloor && matchesSearch;
    });
  }

  // Unique Floors
  get floors(): number[] {
    return [...new Set(this.rooms.map(r => r.floor))].sort((a, b) => a - b);
  }

  // Methods
  openRoomDetails(room: Room) {
    this.selectedRoom = room;
    this.showRoomDetailsModal = true;
  }

  closeModals() {
    this.showAddRoomModal = false;
    this.showRoomDetailsModal = false;
    this.showAddTypeModal = false;
    this.selectedRoom = null;
    this.cdr.detectChanges();
  }

  async updateRoomStatus(room: Room, newStatus: 'Vacant' | 'Occupied' | 'Dirty' | 'Maintenance') {
    try {
      await this.roomService.updateRoomStatus(room.roomId, newStatus);
      room.status = newStatus;
    } catch (err) {
      console.error('Failed to update room status:', err);
    }
  }

  async markAsClean(room: Room) {
    if (room.status === 'Dirty') {
      try {
        await this.roomService.markClean(room.roomId);
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          room.status = 'Vacant';
          this.cdr.detectChanges();
        }, 0);
      } catch (err) {
        console.error('Failed to mark room as clean:', err);
        alert('Failed to mark room as clean. Please try again.');
      }
    }
  }

  async addRoom() {
    // Convert typeId to number (select might return string)
    const typeId = Number(this.newRoom.typeId);

    console.log('Room Types available:', this.roomTypes);
    console.log('Selected typeId:', typeId, 'typeof:', typeof typeId);
    console.log('newRoom:', this.newRoom);

    const roomType = this.roomTypes.find(t => t.typeId === typeId);
    console.log('Found roomType:', roomType);

    if (!roomType) {
      alert('Please select a valid room type. Selected: ' + typeId);
      return;
    }

    if (!this.newRoom.number || this.newRoom.number.trim() === '') {
      alert('Please enter a room number');
      return;
    }

    try {
      console.log('Adding room with data:', {
        number: this.newRoom.number,
        floor: this.newRoom.floor,
        typeId: typeId,
        status: 'Vacant'
      });

      const room = await this.roomService.createRoom({
        number: this.newRoom.number,
        floor: Number(this.newRoom.floor),
        typeId: typeId,
        status: 'Vacant'
      });

      console.log('Room added response:', room);

      // Reload rooms to get fresh data from API
      await this.loadData();

      const roomNumber = this.newRoom.number;
      this.closeModals();
      this.newRoom = { number: '', floor: 1, typeId: this.roomTypes[0]?.typeId || 0, status: 'Vacant' };
      alert(`Room ${roomNumber} added successfully!`);
    } catch (err) {
      console.error('Failed to add room:', err);
      alert('Failed to add room. Please check console for details.');
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Vacant': '✅',
      'vacant': '✅',
      'Occupied': '🔒',
      'occupied': '🔒',
      'Dirty': '🧹',
      'dirty': '🧹',
      'Maintenance': '🔧',
      'maintenance': '🔧'
    };
    return icons[status] || '❓';
  }

  getRoomTypeName(room: Room): string {
    return room.roomType?.name || 'Unknown';
  }

  getRoomBaseRate(room: Room): number {
    return room.roomType?.baseRate || 0;
  }

  getRoomMaxGuests(room: Room): number {
    return room.roomType?.maxGuests || 2;
  }

  getRoomAmenities(room: Room): string[] {
    return [];
  }

  getRoomTypeCount(type: RoomType): number {
    return this.rooms.filter(r => r.typeId === type.typeId).length;
  }

  getRoomTypeAmenities(type: RoomType): string[] {
    return [];
  }
}
