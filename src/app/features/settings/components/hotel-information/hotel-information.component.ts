import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, HotelSettings } from '../../../../core/services/settings.service';
import { HotelService, HotelInformationDto } from '../../../../core/services/hotel.service';
import { CurrencyService, CurrencyDto } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-hotel-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <h2 class="panel-title">🏨 Hotel Information</h2>
        <p class="panel-description">Basic information about your hotel</p>
      </div>

      <div *ngIf="hotelInfoLoading" class="loading-state" style="text-align: center; padding: 20px;">
        <span>Loading hotel information...</span>
      </div>

      <div *ngIf="!hotelInfoLoading">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Hotel Name</label>
            <input type="text" class="form-input" [(ngModel)]="hotelSettings.name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" [(ngModel)]="hotelSettings.email">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" class="form-input" [(ngModel)]="hotelSettings.phone">
          </div>
          <div class="form-group">
            <label class="form-label">Website</label>
            <input type="url" class="form-input" [(ngModel)]="hotelSettings.website">
          </div>
          <div class="form-group full-width">
            <label class="form-label">Address</label>
            <textarea class="form-textarea" [(ngModel)]="hotelSettings.address"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">GSTIN</label>
            <input type="text" class="form-input" [(ngModel)]="hotelSettings.gstin">
          </div>
        </div>

        <div class="section-divider"></div>

        <h3 class="section-title">Check-in / Check-out Times</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Default Check-in Time</label>
            <input type="time" class="form-input" [(ngModel)]="hotelSettings.checkInTime">
          </div>
          <div class="form-group">
            <label class="form-label">Default Check-out Time</label>
            <input type="time" class="form-input" [(ngModel)]="hotelSettings.checkOutTime">
          </div>
          <div class="form-group">
            <label class="form-label">Currency</label>
            <select class="form-select" [(ngModel)]="hotelSettings.currency" (change)="onCurrencyChange()">
              <option *ngFor="let currency of currencies" [value]="currency.currencyCode">
                {{ currency.currencyName }} ({{ currency.symbol }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <select class="form-select" [(ngModel)]="hotelSettings.timezone">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn btn-primary" (click)="saveHotelInfo()" [disabled]="savingHotelInfo">
            {{ savingHotelInfo ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel { padding: 24px; }
    .panel-header { margin-bottom: 24px; }
    .panel-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
    .panel-description { color: var(--text-secondary); font-size: 0.875rem; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .form-group { margin-bottom: 0; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
    .form-input, .form-select, .form-textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); transition: all 0.2s; }
    .form-textarea { resize: vertical; min-height: 100px; }

    .section-divider { height: 1px; background: var(--border-color); margin: 2rem 0; }
    .section-title { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1.5rem; }

    .panel-footer { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
    .btn { padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class HotelInformationComponent implements OnInit {
  hotelSettings!: HotelSettings;
  hotelInfo: HotelInformationDto = {};
  hotelInfoLoading = false;
  savingHotelInfo = false;
  currencies: CurrencyDto[] = [];

  constructor(
    private settingsService: SettingsService,
    private hotelService: HotelService,
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.hotelSettings = this.settingsService.getHotelSettings();
    this.loadHotelInformation();
    this.loadCurrencies();
  }

  async loadCurrencies() {
    try {
      this.currencies = await this.currencyService.getCurrencies();
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  }

  onCurrencyChange() {
    const selectedCurrency = this.currencies.find(c => c.currencyCode === this.hotelSettings.currency);
    if (selectedCurrency) {
      this.hotelSettings.currencySymbol = selectedCurrency.symbol;
      this.cdr.detectChanges();
    }
  }

  async loadHotelInformation() {
    try {
      this.hotelInfoLoading = true;
      this.hotelInfo = await this.hotelService.getHotelInformation();

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
    } finally {
      this.hotelInfoLoading = false;
      this.cdr.detectChanges();
    }
  }

  async saveHotelInfo() {
    try {
      this.savingHotelInfo = true;

      await this.hotelService.insertUpdateHotelInformation({
        hotelId: this.hotelInfo.hotelId || 0,
        hotelName: this.hotelSettings.name,
        email: this.hotelSettings.email,
        phoneNumber: this.hotelSettings.phone,
        website: this.hotelSettings.website,
        address: this.hotelSettings.address,
        gstin: this.hotelSettings.gstin
      });

      this.settingsService.saveHotelSettings(this.hotelSettings);
      alert('Hotel information saved successfully!');
    } catch (error) {
      console.error('Error saving hotel information:', error);
      alert('Error saving hotel information. Please try again.');
    } finally {
      this.savingHotelInfo = false;
    }
  }
}
