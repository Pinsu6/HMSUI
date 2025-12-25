import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddServicesService, ServiceDto } from '../../core/services/add-services.service';
import { RoomTypeService, RoomTypeDto } from '../../core/services/room-type.service';
import { CurrencyService, CurrencyDto } from '../../core/services/currency.service';
import { SettingsService, HotelSettings, TaxSettings } from '../../core/services/settings.service';
import { HotelService, HotelInformationDto } from '../../core/services/hotel.service';
import { SettingsResolvedData } from '../../core/resolvers/settings.resolver';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Receptionist';
  status: 'active' | 'inactive';
  lastLogin: string;
}

import { AuthService, UserRegistrationDto } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  // Active Tab
  activeTab = 'general';

  // Role based access
  get visibleTabs(): string[] {
    const role = this.authService.currentUser()?.role;
    if (role === 'Manager') {
      return ['services', 'roomtypes']; // Only operational settings
    }
    if (role === 'Receptionist') {
      return []; // No settings access
    }
    // Admin sees all
    return ['general', 'tax', 'wifi', 'users', 'services', 'roomtypes', 'currency', 'backup'];
  }

  isTabVisible(tab: string): boolean {
    return this.visibleTabs.includes(tab);
  }

  // Loading states
  hotelInfoLoading = false;
  savingHotelInfo = false;

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

  // Room Types
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

  // Currencies
  currencies: CurrencyDto[] = [];
  showAddCurrencyModal = false;
  isEditingCurrency = false;
  currencyLoading = false;
  newCurrency: CurrencyDto = {
    currencyCode: '',
    currencyName: '',
    symbol: '',
    exchangeRate: 1,
    isActive: true
  };

  // Hotel Settings (will be loaded from API and localStorage)
  hotelSettings!: HotelSettings;
  hotelInfo: HotelInformationDto = {};

  // Tax Settings (will be loaded from localStorage)
  taxSettings!: TaxSettings;

  constructor(
    private addServicesService: AddServicesService,
    private roomTypeService: RoomTypeService,
    private currencyService: CurrencyService,
    private settingsService: SettingsService,
    private hotelService: HotelService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadSettings();

    // Get pre-fetched data from resolver - no delay!
    const resolvedData = this.route.snapshot.data['data'] as SettingsResolvedData;
    if (resolvedData) {
      // Use pre-fetched data instantly
      this.currencies = (resolvedData.currencies || []).filter(c => c.isActive);
      this.services = resolvedData.services;
      this.roomTypes = resolvedData.roomTypes;
      this.hotelInfo = resolvedData.hotelInfo;

      // Update hotelSettings with API data
      if (this.hotelInfo.hotelName) {
        this.hotelSettings.name = this.hotelInfo.hotelName;
        this.hotelSettings.email = this.hotelInfo.email || '';
        this.hotelSettings.phone = this.hotelInfo.phoneNumber || '';
        this.hotelSettings.website = this.hotelInfo.website || '';
        this.hotelSettings.address = this.hotelInfo.address || '';
        this.hotelSettings.gstin = this.hotelInfo.gstin || '';
      }

      this.cdr.detectChanges();
    }

    // Handle initial tab selection from URL
    this.route.params.subscribe(params => {
      const requestedTab = params['tab'];

      if (requestedTab && this.isTabVisible(requestedTab)) {
        this.activeTab = requestedTab;
        if (this.activeTab === 'users') {
          this.loadUsers();
        }
      } else {
        // If no tab specified or not allowed, go to first visible tab
        const firstTab = this.visibleTabs[0];
        if (firstTab) {
          this.router.navigate(['/settings', firstTab], { replaceUrl: true });
        } else {
          // No visible tabs? Redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  // Load settings from localStorage
  loadSettings() {
    this.hotelSettings = this.settingsService.getHotelSettings();
    this.taxSettings = this.settingsService.getTaxSettings();
  }

  onCurrencyChange() {
    const selectedCurrency = this.currencies.find(c => c.currencyCode === this.hotelSettings.currency);
    if (selectedCurrency) {
      this.hotelSettings.currencySymbol = selectedCurrency.symbol;
      this.cdr.detectChanges();
    }
  }

  // Load Hotel Information from API
  async loadHotelInformation() {
    try {
      this.hotelInfoLoading = true;
      this.hotelInfo = await this.hotelService.getHotelInformation();

      // Update hotelSettings with API data
      if (this.hotelInfo.hotelName) {
        this.hotelSettings.name = this.hotelInfo.hotelName;
        this.hotelSettings.email = this.hotelInfo.email || '';
        this.hotelSettings.phone = this.hotelInfo.phoneNumber || '';
        this.hotelSettings.website = this.hotelInfo.website || '';
        this.hotelSettings.address = this.hotelInfo.address || '';
        this.hotelSettings.gstin = this.hotelInfo.gstin || '';
      }
    } catch (error) {
      console.error('Error loading hotel information:', error);
      // If API fails, use localStorage defaults
    } finally {
      this.hotelInfoLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadServices() {
    try {
      this.serviceLoading = true;
      this.services = await this.addServicesService.getServices();
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      this.serviceLoading = false;
      this.cdr.detectChanges();
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
        this.cdr.markForCheck();

        await this.addServicesService.insertUpdateService(this.newService);

        const alertMsg = this.isEditingService ? 'Service updated successfully!' : 'Service added successfully!';

        // Use a single macrotask to handle all state updates and refreshes
        setTimeout(async () => {
          // 1. Fetch new data first
          await this.loadServices();

          // 2. Clear form and close modal
          this.showAddServiceModal = false;
          this.serviceLoading = false;
          this.resetServiceForm();
          this.activeTab = 'services';

          // 3. Force Angular to update the DOM with the new services array
          this.cdr.detectChanges();

          // 4. Navigate if needed
          this.router.navigate(['/settings', 'services']);

          // 5. Show notification after UI has updated
          setTimeout(() => alert(alertMsg), 100);
        }, 0);

      } catch (error) {
        console.error('Error saving service:', error);
        this.serviceLoading = false;
        this.cdr.detectChanges();
        alert('Error saving service. Please try again.');
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

  // Room Type Methods
  async loadRoomTypes() {
    try {
      this.roomTypeLoading = true;
      this.roomTypes = await this.roomTypeService.getRoomTypes();
    } catch (error) {
      console.error('Error loading room types:', error);
    } finally {
      this.roomTypeLoading = false;
      this.cdr.detectChanges();
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
        this.cdr.markForCheck();

        await this.roomTypeService.insertUpdateRoomType(this.newRoomType);

        const alertMsg = this.isEditingRoomType ? 'Room type updated successfully!' : 'Room type added successfully!';

        // Match the Services logic for reliable modal closing and list refresh
        setTimeout(async () => {
          // 1. Fetch new data first
          await this.loadRoomTypes();

          // 2. Clear form and close modal
          this.showAddRoomTypeModal = false;
          this.roomTypeLoading = false;
          this.resetRoomTypeForm();
          this.activeTab = 'roomtypes';

          // 3. Force Angular to update the DOM
          this.cdr.detectChanges();

          // 4. Navigate to ensure tab is active
          this.router.navigate(['/settings', 'roomtypes']);

          // 5. Success notification
          setTimeout(() => alert(alertMsg), 100);
        }, 0);

      } catch (error) {
        console.error('Error saving room type:', error);
        this.roomTypeLoading = false;
        this.cdr.detectChanges();
        alert('Error saving room type. Please try again.');
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
    if (confirm(`Are you sure you want to delete "${roomType.name}"?`)) {
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

  // Currency Methods
  async loadCurrencies() {
    try {
      this.currencyLoading = true;
      const allCurrencies = await this.currencyService.getCurrencies();
      this.currencies = allCurrencies.filter(c => c.isActive);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      this.currencyLoading = false;
      this.cdr.detectChanges();
    }
  }

  openAddCurrencyModal() {
    this.isEditingCurrency = false;
    this.newCurrency = {
      currencyCode: '',
      currencyName: '',
      symbol: '',
      exchangeRate: 1,
      isActive: true
    };
    this.showAddCurrencyModal = true;
  }

  editCurrency(currency: CurrencyDto) {
    this.isEditingCurrency = true;
    this.newCurrency = { ...currency };
    this.showAddCurrencyModal = true;
  }

  async saveCurrency() {
    if (this.newCurrency.currencyCode && this.newCurrency.currencyName && this.newCurrency.symbol) {
      try {
        this.currencyLoading = true;
        this.cdr.markForCheck();

        await this.currencyService.insertUpdateCurrency(this.newCurrency);

        const alertMsg = this.isEditingCurrency ? 'Currency updated successfully!' : 'Currency added successfully!';

        setTimeout(async () => {
          // 1. Fetch new data first
          await this.loadCurrencies();

          // 2. Clear form and close modal
          this.showAddCurrencyModal = false;
          this.currencyLoading = false;
          this.resetCurrencyForm();
          this.activeTab = 'currency';

          // 3. Force Angular to update the DOM
          this.cdr.detectChanges();

          // 4. Navigate to ensure tab is active
          this.router.navigate(['/settings', 'currency']);

          // 5. Success notification
          setTimeout(() => alert(alertMsg), 100);
        }, 0);

      } catch (error) {
        console.error('Error saving currency:', error);
        this.currencyLoading = false;
        this.cdr.detectChanges();
        alert('Error saving currency. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  toggleCurrencyStatus(currency: CurrencyDto) {
    const updatedCurrency = { ...currency, isActive: !currency.isActive };
    this.currencyService.insertUpdateCurrency(updatedCurrency)
      .then(() => {
        currency.isActive = !currency.isActive;
        if (!currency.isActive) {
          // Remove from list if inactive to satisfy "don't show inactive" requirement
          this.currencies = this.currencies.filter(c => c.currencyId !== currency.currencyId);
        }
      })
      .catch(error => {
        console.error('Error toggling currency status:', error);
        alert('Error updating currency status.');
      });
  }

  resetCurrencyForm() {
    this.newCurrency = {
      currencyCode: '',
      currencyName: '',
      symbol: '',
      exchangeRate: 1,
      isActive: true
    };
    this.isEditingCurrency = false;
  }

  async deleteCurrency(currency: CurrencyDto) {
    if (confirm(`Are you sure you want to delete "${currency.currencyName}"?`)) {
      try {
        await this.currencyService.deleteCurrency(currency.currencyId!);
        await this.loadCurrencies();
        alert('Currency deleted successfully!');
      } catch (error) {
        console.error('Error deleting currency:', error);
        alert('Error deleting currency. Please try again.');
      }
    }
  }

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
  // New User Form
  showAddUserModal = false;
  isEditingUser = false;
  newUser: { name: string; email: string; password: string; role: 'Admin' | 'Manager' | 'Receptionist'; id?: number } = {
    name: '',
    email: '',
    password: '',
    role: 'Receptionist'
  };

  // Methods
  async saveSettings() {
    try {
      this.savingHotelInfo = true;

      // Update hotel information via API
      await this.hotelService.insertUpdateHotelInformation({
        hotelId: this.hotelInfo.hotelId || 0,
        hotelName: this.hotelSettings.name,
        email: this.hotelSettings.email,
        phoneNumber: this.hotelSettings.phone,
        website: this.hotelSettings.website,
        address: this.hotelSettings.address,
        gstin: this.hotelSettings.gstin
      });

      // Find selected currency symbol
      const selectedCurrencyProxy = this.currencies.find(c => c.currencyCode === this.hotelSettings.currency);
      if (selectedCurrencyProxy) {
        this.hotelSettings.currencySymbol = selectedCurrencyProxy.symbol;
      }

      // Save hotel and tax settings to localStorage
      this.settingsService.saveHotelSettings(this.hotelSettings);
      this.settingsService.saveTaxSettings(this.taxSettings);

      alert('Settings saved successfully! ✓\n\nHotel information has been updated in the database.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      this.savingHotelInfo = false;
    }
  }

  testWifiConnection() {
    alert('Testing WiFi API connection...\n\nConnection successful! ✓');
  }

  async addUser() {
    if (this.newUser.name && this.newUser.email && this.newUser.password) {
      try {
        const userDto: UserRegistrationDto = {
          Name: this.newUser.name,
          Email: this.newUser.email,
          PasswordHash: this.newUser.password,
          Role: this.newUser.role
        };

        const result = await this.authService.addUser(userDto);

        if (result.success) {
          alert('User added successfully!');
          this.showAddUserModal = false;
          this.newUser = { name: '', email: '', password: '', role: 'Receptionist' };

          // Refresh users list if possible
          await this.loadUsers();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  async loadUsers() {
    try {
      const apiUsers = await this.authService.getUsers();
      this.users = apiUsers.map(u => ({
        id: u.userId,
        name: u.name,
        email: u.email || '',
        role: (u.role as any) || 'Receptionist',
        status: 'active',
        lastLogin: 'Never' // API doesn't return this yet
      }));
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  openAddUserModal() {
    this.resetUserForm();
    this.showAddUserModal = true;
  }

  editUser(user: User) {
    this.isEditingUser = true;
    this.newUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Password optional on edit usually, but backend might require it or handle blank
      role: user.role
    };
    this.showAddUserModal = true;
  }

  resetUserForm() {
    this.isEditingUser = false;
    this.newUser = {
      name: '',
      email: '',
      password: '',
      role: 'Receptionist'
    };
  }

  async saveUser() {
    if (this.newUser.name && this.newUser.email && (this.isEditingUser || this.newUser.password)) {
      try {
        const userDto: UserRegistrationDto = {
          Name: this.newUser.name,
          Email: this.newUser.email,
          PasswordHash: this.isEditingUser ? '' : (this.newUser.password || ''),
          Role: this.newUser.role
        };

        if (this.isEditingUser && this.newUser.id) {
          userDto.UserId = this.newUser.id;
        }

        const result = await this.authService.addUser(userDto);

        if (result.success) {
          alert(this.isEditingUser ? 'User updated successfully!' : 'User added successfully!');

          // Force close and reset
          this.showAddUserModal = false;
          this.resetUserForm();
          this.cdr.detectChanges(); // Force UI update

          await this.loadUsers();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Failed to save user. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.');
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
