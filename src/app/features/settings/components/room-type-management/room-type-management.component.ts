import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomTypeService, RoomTypeDto } from '../../../../core/services/room-type.service';
import { SettingsService } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-room-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">🛏️ Room Types</h2>
          <p class="panel-description">Manage room types and their rates</p>
        </div>
        <button class="btn btn-primary" (click)="openAddRoomTypeModal()">
          ➕ Add Room Type
        </button>
      </div>

      <div class="services-table">
        <table class="table">
          <thead>
            <tr>
              <th>Type Name</th>
              <th>Base Rate ({{ settingsService.getCurrencySymbol() }})</th>
              <th>Max Guests</th>
              <th>Amenities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let roomType of roomTypes">
              <td>
                <span class="service-name">{{ roomType.name }}</span>
              </td>
              <td>
                <span class="service-rate">{{ settingsService.getCurrencySymbol() }}{{ roomType.baseRate | number:'1.2-2' }}</span>
              </td>
              <td>
                <span>{{ roomType.maxGuests }}</span>
              </td>
              <td>
                <span class="service-desc">{{ roomType.amenities || '-' }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-ghost" title="Edit" (click)="editRoomType(roomType)">✏️</button>
                  <button class="btn btn-sm btn-ghost" title="Delete" (click)="deleteRoomType(roomType)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="roomTypes.length === 0 && !roomTypeLoading">
              <td colspan="5" class="empty-state">
                <span>No room types found. Add your first room type!</span>
              </td>
            </tr>
            <tr *ngIf="roomTypeLoading">
              <td colspan="5" class="loading-state">
                <span>Loading room types...</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="services-info">
        <h4>Room Type Examples</h4>
        <div class="info-card">
          <span class="info-icon">🏨</span>
          <span class="info-desc">Deluxe, Suite, Standard, Superior, Family Room, etc.</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Room Type Modal -->
    <div class="modal-overlay" [class.active]="showAddRoomTypeModal" (click)="showAddRoomTypeModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingRoomType ? 'Edit Room Type' : 'Add New Room Type' }}</h3>
          <button class="btn btn-icon btn-ghost" (click)="showAddRoomTypeModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Room Type Name *</label>
            <input type="text" class="form-input" [(ngModel)]="newRoomType.name"
              placeholder="e.g., Deluxe, Suite, Standard">
          </div>
          <div class="form-group">
            <label class="form-label">Base Rate ({{ settingsService.getCurrencySymbol() }}) *</label>
            <input type="number" class="form-input" [(ngModel)]="newRoomType.baseRate" placeholder="Enter base rate"
              min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Max Guests *</label>
            <input type="number" class="form-input" [(ngModel)]="newRoomType.maxGuests" placeholder="Enter max guests"
              min="1">
          </div>
          <div class="form-group">
            <label class="form-label">Amenities</label>
            <textarea class="form-textarea" [(ngModel)]="newRoomType.amenities"
              placeholder="e.g., WiFi, AC, TV, Mini Bar (comma separated)" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showAddRoomTypeModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="saveRoomType()" [disabled]="roomTypeLoading">
            {{ roomTypeLoading ? 'Saving...' : (isEditingRoomType ? 'Update Room Type' : 'Add Room Type') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel { padding: 24px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .panel-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
    .panel-description { color: var(--text-secondary); font-size: 0.875rem; }
    
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .table th { font-weight: 500; color: var(--text-secondary); font-size: 0.875rem; }
    
    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
    .btn-ghost { background: transparent; color: var(--text-secondary); padding: 0.25rem; }
    .btn-icon { padding: 0.5rem; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; border-radius: 50%; width: 32px; height: 32px; border: none; cursor: pointer; }

    .action-buttons { display: flex; gap: 0.5rem; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.2s; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .modal { background: var(--bg-primary); border-radius: 0.75rem; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); transform: scale(0.95); transition: all 0.2s; }
    .modal-overlay.active .modal { transform: scale(1); }
    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { padding: 1rem 1.5rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
    
    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
    .form-input, .form-textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); transition: all 0.2s; }
    
    .services-info { margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 0.75rem; }
    .info-card { display: flex; align-items: center; gap: 1rem; }
    .info-icon { font-size: 1.5rem; }
  `]
})
export class RoomTypeManagementComponent implements OnInit {
  roomTypes: RoomTypeDto[] = [];
  showAddRoomTypeModal = false;
  isEditingRoomType = false;
  roomTypeLoading = false;
  newRoomType: RoomTypeDto = {
    name: '',
    baseRate: 0,
    maxGuests: 1,
    amenities: ''
  };

  constructor(
    private roomTypeService: RoomTypeService,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.loadRoomTypes();
  }

  async loadRoomTypes() {
    try {
      this.roomTypeLoading = true;
      this.roomTypes = await this.roomTypeService.getRoomTypes();
    } catch (error) {
      console.error('Error loading room types:', error);
    } finally {
      this.roomTypeLoading = false;
    }
  }

  openAddRoomTypeModal() {
    this.isEditingRoomType = false;
    this.newRoomType = {
      name: '',
      baseRate: 0,
      maxGuests: 1,
      amenities: ''
    };
    this.showAddRoomTypeModal = true;
  }

  editRoomType(roomType: RoomTypeDto) {
    this.isEditingRoomType = true;
    this.newRoomType = { ...roomType };
    this.showAddRoomTypeModal = true;
  }

  async saveRoomType() {
    if (this.newRoomType.name && this.newRoomType.baseRate >= 0 && this.newRoomType.maxGuests > 0) {
      try {
        this.roomTypeLoading = true;
        await this.roomTypeService.insertUpdateRoomType(this.newRoomType);
        this.showAddRoomTypeModal = false;
        this.resetRoomTypeForm();
        await this.loadRoomTypes();
        alert(this.isEditingRoomType ? 'Room type updated successfully!' : 'Room type added successfully!');
      } catch (error) {
        console.error('Error saving room type:', error);
        alert('Error saving room type. Please try again.');
      } finally {
        this.roomTypeLoading = false;
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  resetRoomTypeForm() {
    this.newRoomType = {
      name: '',
      baseRate: 0,
      maxGuests: 1,
      amenities: ''
    };
    this.isEditingRoomType = false;
  }

  async deleteRoomType(roomType: RoomTypeDto) {
    if (confirm(`Are you sure you want to delete "\${roomType.name}"?`)) {
      try {
        await this.roomTypeService.deleteRoomType(roomType.typeId!);
        await this.loadRoomTypes();
        alert('Room type deleted successfully!');
      } catch (error) {
        console.error('Error deleting room type:', error);
        alert('Error deleting room type. Please try again.');
      }
    }
  }
}
