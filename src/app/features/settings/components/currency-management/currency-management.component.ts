import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService, CurrencyDto } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-currency-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">💰 Currency Management</h2>
          <p class="panel-description">Manage currencies and exchange rates</p>
        </div>
        <button class="btn btn-primary" (click)="openAddCurrencyModal()">
          ➕ Add Currency
        </button>
      </div>

      <div class="services-table">
        <table class="table">
          <thead>
            <tr>
              <th>Currency Code</th>
              <th>Currency Name</th>
              <th>Symbol</th>
              <th>Exchange Rate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let currency of currencies">
              <td>
                <span class="service-name">{{ currency.currencyCode }}</span>
              </td>
              <td>
                <span>{{ currency.currencyName }}</span>
              </td>
              <td>
                <span class="service-rate">{{ currency.symbol }}</span>
              </td>
              <td>
                <span>{{ currency.exchangeRate | number:'1.4-4' }}</span>
              </td>
              <td>
                <span class="status-badge" [class.active]="currency.isActive" [class.inactive]="!currency.isActive">
                  {{ currency.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-ghost" title="Edit" (click)="editCurrency(currency)">✏️</button>
                  <button class="btn btn-sm btn-ghost" title="Toggle Status" (click)="toggleCurrencyStatus(currency)">
                    {{ currency.isActive ? '🔒' : '🔓' }}
                  </button>
                  <button class="btn btn-sm btn-ghost" title="Delete" (click)="deleteCurrency(currency)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="currencies.length === 0 && !currencyLoading">
              <td colspan="6" class="empty-state">
                <span>No currencies found. Add your first currency!</span>
              </td>
            </tr>
            <tr *ngIf="currencyLoading">
              <td colspan="6" class="loading-state">
                <span>Loading currencies...</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="services-info">
        <h4>Currency Examples</h4>
        <div class="info-card">
          <span class="info-icon">💱</span>
          <span class="info-desc">INR (₹), USD ($), EUR (€), GBP (£), etc.</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Currency Modal -->
    <div class="modal-overlay" [class.active]="showAddCurrencyModal" (click)="showAddCurrencyModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingCurrency ? 'Edit Currency' : 'Add New Currency' }}</h3>
          <button class="btn btn-icon btn-ghost" (click)="showAddCurrencyModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Currency Code *</label>
            <input type="text" class="form-input" [(ngModel)]="newCurrency.currencyCode" placeholder="e.g., INR, USD, EUR"
              maxlength="10">
          </div>
          <div class="form-group">
            <label class="form-label">Currency Name *</label>
            <input type="text" class="form-input" [(ngModel)]="newCurrency.currencyName"
              placeholder="e.g., Indian Rupee, US Dollar">
          </div>
          <div class="form-group">
            <label class="form-label">Symbol *</label>
            <input type="text" class="form-input" [(ngModel)]="newCurrency.symbol" placeholder="e.g., ₹, $, €"
              maxlength="10">
          </div>
          <div class="form-group">
            <label class="form-label">Exchange Rate</label>
            <input type="number" class="form-input" [(ngModel)]="newCurrency.exchangeRate"
              placeholder="Enter exchange rate" min="0" step="0.0001">
          </div>
          <div class="form-group">
            <div class="toggle-setting inline">
              <div class="toggle-info">
                <span class="toggle-label">Active Status</span>
                <span class="toggle-description">Currency is available for selection</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="newCurrency.isActive">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showAddCurrencyModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="saveCurrency()" [disabled]="currencyLoading">
            {{ currencyLoading ? 'Saving...' : (isEditingCurrency ? 'Update Currency' : 'Add Currency') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Copy styles from ServiceManagementComponent */
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
export class CurrencyManagementComponent implements OnInit {
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

  constructor(private currencyService: CurrencyService) { }

  ngOnInit() {
    this.loadCurrencies();
  }

  async loadCurrencies() {
    try {
      this.currencyLoading = true;
      this.currencies = await this.currencyService.getCurrencies();
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      this.currencyLoading = false;
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
        await this.currencyService.insertUpdateCurrency(this.newCurrency);
        this.showAddCurrencyModal = false;
        this.resetCurrencyForm();
        await this.loadCurrencies();
        alert(this.isEditingCurrency ? 'Currency updated successfully!' : 'Currency added successfully!');
      } catch (error) {
        console.error('Error saving currency:', error);
        alert('Error saving currency. Please try again.');
      } finally {
        this.currencyLoading = false;
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
    if (confirm(`Are you sure you want to delete "\${currency.currencyName}"?`)) {
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
}
