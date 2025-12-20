import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TaxSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-tax-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <h2 class="panel-title">📋 Tax Settings</h2>
        <p class="panel-description">Configure GST and other tax rates</p>
      </div>

      <div class="toggle-setting">
        <div class="toggle-info">
          <span class="toggle-label">Enable GST</span>
          <span class="toggle-description">Apply Goods and Services Tax on invoices</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [(ngModel)]="taxSettings.enableGst">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="form-grid" *ngIf="taxSettings.enableGst">
        <div class="form-group">
          <label class="form-label">CGST Rate (%)</label>
          <input type="number" class="form-input" [(ngModel)]="taxSettings.cgstRate">
        </div>
        <div class="form-group">
          <label class="form-label">SGST Rate (%)</label>
          <input type="number" class="form-input" [(ngModel)]="taxSettings.sgstRate">
        </div>
        <div class="form-group">
          <label class="form-label">IGST Rate (%)</label>
          <input type="number" class="form-input" [(ngModel)]="taxSettings.igstRate">
        </div>
      </div>

      <div class="section-divider"></div>

      <div class="toggle-setting">
        <div class="toggle-info">
          <span class="toggle-label">Enable Service Charge</span>
          <span class="toggle-description">Add service charge to bills</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [(ngModel)]="taxSettings.enableServiceCharge">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="form-grid" *ngIf="taxSettings.enableServiceCharge">
        <div class="form-group">
          <label class="form-label">Service Charge Rate (%)</label>
          <input type="number" class="form-input" [(ngModel)]="taxSettings.serviceChargeRate">
        </div>
      </div>

      <div class="panel-footer">
        <button class="btn btn-primary" (click)="saveTaxSettings()">Save Changes</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel { padding: 24px; }
    .panel-header { margin-bottom: 24px; }
    .panel-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
    .panel-description { color: var(--text-secondary); font-size: 0.875rem; }

    .toggle-setting { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
    .toggle-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .toggle-label { font-weight: 500; font-size: 0.875rem; }
    .toggle-description { font-size: 0.75rem; color: var(--text-secondary); }
    .toggle-switch { position: relative; width: 44px; height: 24px; display: inline-block; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; border-radius: 24px; }
    .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .toggle-slider { background-color: var(--primary-color); }
    input:checked + .toggle-slider:before { transform: translateX(20px); }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .form-group { margin-bottom: 0; }
    .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
    .form-input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); transition: all 0.2s; }

    .section-divider { height: 1px; background: var(--border-color); margin: 2rem 0; }

    .panel-footer { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
    .btn { padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
  `]
})
export class TaxSettingsComponent implements OnInit {
  taxSettings!: TaxSettings;

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.taxSettings = this.settingsService.getTaxSettings();
  }

  saveTaxSettings() {
    this.settingsService.saveTaxSettings(this.taxSettings);
    alert('Tax settings saved successfully!');
  }
}
