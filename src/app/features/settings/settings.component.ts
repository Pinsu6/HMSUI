import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class SettingsComponent {
  // Active Tab
  activeTab = 'general';

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
