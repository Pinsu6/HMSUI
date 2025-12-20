import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddServicesService, ServiceDto } from '../../../../core/services/add-services.service';
import { SettingsService } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">🛎️ Add Services</h2>
          <p class="panel-description">Manage hotel services and their rates</p>
        </div>
        <button class="btn btn-primary" (click)="openAddServiceModal()">
          ➕ Add Service
        </button>
      </div>

      <div class="services-table">
        <table class="table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Rate ({{ settingsService.getCurrencySymbol() }})</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let service of services">
              <td>
                <span class="service-name">{{ service.serviceName }}</span>
              </td>
              <td>
                <span class="service-desc">{{ service.description || '-' }}</span>
              </td>
              <td>
                <span class="service-rate">{{ settingsService.getCurrencySymbol() }}{{ service.rate | number:'1.2-2' }}</span>
              </td>
              <td>
                <span class="status-badge" [class.active]="service.isActive" [class.inactive]="!service.isActive">
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-ghost" title="Edit" (click)="editService(service)">✏️</button>
                  <button class="btn btn-sm btn-ghost" title="Toggle Status" (click)="toggleServiceStatus(service)">
                    {{ service.isActive ? '🔒' : '🔓' }}
                  </button>
                  <button class="btn btn-sm btn-ghost" title="Delete" (click)="deleteService(service)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="services.length === 0 && !serviceLoading">
              <td colspan="5" class="empty-state">
                <span>No services found. Add your first service!</span>
              </td>
            </tr>
            <tr *ngIf="serviceLoading">
              <td colspan="5" class="loading-state">
                <span>Loading services...</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="services-info">
        <h4>Service Types</h4>
        <div class="info-card">
          <span class="info-icon">🍽️</span>
          <span class="info-desc">Room Service, Laundry, Spa, Mini Bar, Extra Bed, etc.</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <div class="modal-overlay" [class.active]="showAddServiceModal" (click)="showAddServiceModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingService ? 'Edit Service' : 'Add New Service' }}</h3>
          <button class="btn btn-icon btn-ghost" (click)="showAddServiceModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Service Name *</label>
            <input type="text" class="form-input" [(ngModel)]="newService.serviceName" placeholder="Enter service name">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" [(ngModel)]="newService.description" placeholder="Enter service description"
              rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Rate ({{ settingsService.getCurrencySymbol() }}) *</label>
            <input type="number" class="form-input" [(ngModel)]="newService.rate" placeholder="Enter rate" min="0">
          </div>
          <div class="form-group">
            <div class="toggle-setting inline">
              <div class="toggle-info">
                <span class="toggle-label">Active Status</span>
                <span class="toggle-description">Service is available for selection</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="newService.isActive">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showAddServiceModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="saveService()" [disabled]="serviceLoading">
            {{ serviceLoading ? 'Saving...' : (isEditingService ? 'Update Service' : 'Add Service') }}
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
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500; }
    .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .status-badge.inactive { background: rgba(100, 116, 139, 0.1); color: #64748b; }

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
    
    .toggle-setting { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
    .toggle-setting.inline { padding: 0; }
    .toggle-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .toggle-label { font-weight: 500; font-size: 0.875rem; }
    .toggle-description { font-size: 0.75rem; color: var(--text-secondary); }
    .toggle-switch { position: relative; width: 44px; height: 24px; display: inline-block; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; border-radius: 24px; }
    .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .toggle-slider { background-color: var(--primary-color); }
    input:checked + .toggle-slider:before { transform: translateX(20px); }

    .services-info { margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 0.75rem; }
    .info-card { display: flex; align-items: center; gap: 1rem; }
    .info-icon { font-size: 1.5rem; }
  `]
})
export class ServiceManagementComponent implements OnInit {
  services: ServiceDto[] = [];
  showAddServiceModal = false;
  isEditingService = false;
  serviceLoading = false;
  newService: ServiceDto = {
    serviceName: '',
    description: '',
    rate: 0,
    isActive: true
  };

  constructor(
    private addServicesService: AddServicesService,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.loadServices();
  }

  async loadServices() {
    try {
      this.serviceLoading = true;
      this.services = await this.addServicesService.getServices();
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      this.serviceLoading = false;
    }
  }

  openAddServiceModal() {
    this.isEditingService = false;
    this.newService = {
      serviceName: '',
      description: '',
      rate: 0,
      isActive: true
    };
    this.showAddServiceModal = true;
  }

  editService(service: ServiceDto) {
    this.isEditingService = true;
    this.newService = { ...service };
    this.showAddServiceModal = true;
  }

  async saveService() {
    if (this.newService.serviceName && this.newService.rate >= 0) {
      try {
        this.serviceLoading = true;
        await this.addServicesService.insertUpdateService(this.newService);
        this.showAddServiceModal = false;
        this.resetServiceForm();
        await this.loadServices();
        alert(this.isEditingService ? 'Service updated successfully!' : 'Service added successfully!');
      } catch (error) {
        console.error('Error saving service:', error);
        alert('Error saving service. Please try again.');
      } finally {
        this.serviceLoading = false;
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  toggleServiceStatus(service: ServiceDto) {
    const updatedService = { ...service, isActive: !service.isActive };
    this.addServicesService.insertUpdateService(updatedService)
      .then(() => {
        service.isActive = !service.isActive;
      })
      .catch(error => {
        console.error('Error toggling service status:', error);
        alert('Error updating service status.');
      });
  }

  resetServiceForm() {
    this.newService = {
      serviceName: '',
      description: '',
      rate: 0,
      isActive: true
    };
    this.isEditingService = false;
  }

  async deleteService(service: ServiceDto) {
    if (confirm(`Are you sure you want to delete "\${service.serviceName}"?`)) {
      try {
        await this.addServicesService.deleteService(service.serviceId!);
        await this.loadServices();
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service. Please try again.');
      }
    }
  }
}
