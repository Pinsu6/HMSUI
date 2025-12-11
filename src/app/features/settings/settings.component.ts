import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddServicesService, ServiceDto } from '../../core/services/add-services.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Receptionist';
  status: 'active' | 'inactive';
  lastLogin: string;
}

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  // Active Tab
  activeTab = 'general';

  // Services
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

  constructor(private addServicesService: AddServicesService) { }

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
    if (confirm(`Are you sure you want to delete "${service.serviceName}"?`)) {
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

  // Hotel Settings
  hotelSettings = {
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

  // Tax Settings
  taxSettings = {
    enableGst: true,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    enableServiceCharge: false,
    serviceChargeRate: 10
  };

  // WiFi API Settings
  wifiSettings = {
    enabled: true,
    apiEndpoint: 'https://wifi.hotel.com/api',
    apiKey: '••••••••••••••••',
    onboardingEndpoint: '/wifi/api/create-guest',
    deactivationEndpoint: '/wifi/api/expire-guest'
  };

  // Users
  users: User[] = [];

  // New User Form
  showAddUserModal = false;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'Receptionist' as const
  };

  // Methods
  saveSettings() {
    alert('Settings saved successfully!');
  }

  testWifiConnection() {
    alert('Testing WiFi API connection...\n\nConnection successful! ✓');
  }

  addUser() {
    if (this.newUser.name && this.newUser.email && this.newUser.password) {
      this.users.push({
        id: this.users.length + 1,
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role,
        status: 'active',
        lastLogin: 'Never'
      });
      this.showAddUserModal = false;
      this.newUser = { name: '', email: '', password: '', role: 'Receptionist' };
      alert('User added successfully!');
    }
  }

  toggleUserStatus(user: User) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }
}
