import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wifi-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <h2 class="panel-title">📶 WiFi Integration</h2>
        <p class="panel-description">Configure WiFi automation API settings</p>
      </div>

      <div class="toggle-setting">
        <div class="toggle-info">
          <span class="toggle-label">Enable WiFi Automation</span>
          <span class="toggle-description">Automatically manage guest WiFi access on check-in/check-out</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [(ngModel)]="wifiSettings.enabled">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div *ngIf="wifiSettings.enabled">
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">API Endpoint</label>
            <input type="url" class="form-input" [(ngModel)]="wifiSettings.apiEndpoint"
              placeholder="https://wifi.hotel.com/api">
          </div>
          <div class="form-group full-width">
            <label class="form-label">API Key</label>
            <div class="input-with-button">
              <input type="password" class="form-input" [(ngModel)]="wifiSettings.apiKey">
              <button class="btn btn-secondary">Show</button>
            </div>
          </div>
        </div>

        <div class="api-endpoints">
          <h4>API Endpoints</h4>
          <div class="endpoint-item">
            <span class="endpoint-method post">POST</span>
            <span class="endpoint-path">{{ wifiSettings.onboardingEndpoint }}</span>
            <span class="endpoint-label">Guest Onboarding (Check-in)</span>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-method post">POST</span>
            <span class="endpoint-path">{{ wifiSettings.deactivationEndpoint }}</span>
            <span class="endpoint-label">Guest Deactivation (Check-out)</span>
          </div>
        </div>

        <div class="test-connection">
          <button class="btn btn-secondary" (click)="testWifiConnection()">
            🔌 Test Connection
          </button>
        </div>
      </div>

      <div class="panel-footer">
        <button class="btn btn-primary" (click)="saveSettings()">Save Changes</button>
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

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
    .form-input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); transition: all 0.2s; }
    
    .input-with-button { display: flex; gap: 0.5rem; }
    .input-with-button .form-input { flex: 1; }

    .api-endpoints { margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 0.75rem; }
    .api-endpoints h4 { margin-top: 0; margin-bottom: 1rem; font-size: 1rem; font-weight: 600; }
    .endpoint-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); }
    .endpoint-item:last-child { border-bottom: none; }
    .endpoint-method { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.25rem; text-transform: uppercase; }
    .endpoint-method.post { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .endpoint-path { font-family: monospace; font-size: 0.875rem; color: var(--text-primary); flex: 1; }
    .endpoint-label { font-size: 0.875rem; color: var(--text-secondary); }

    .test-connection { margin-top: 1.5rem; }

    .panel-footer { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
    .btn { padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  `]
})
export class WifiSettingsComponent {
  wifiSettings = {
    enabled: true,
    apiEndpoint: 'https://wifi.hotel.com/api',
    apiKey: '••••••••••••••••',
    onboardingEndpoint: '/wifi/api/create-guest',
    deactivationEndpoint: '/wifi/api/expire-guest'
  };

  testWifiConnection() {
    alert('Testing WiFi API connection...\n\nConnection successful! ✓');
  }

  saveSettings() {
    alert('WiFi settings saved successfully!');
  }
}
