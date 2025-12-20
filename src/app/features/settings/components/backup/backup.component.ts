import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <h2 class="panel-title">💾 Backup & Data</h2>
        <p class="panel-description">Manage data backup and restore options</p>
      </div>

      <div class="backup-actions">
        <div class="backup-card">
          <div class="backup-icon">📥</div>
          <div class="backup-info">
            <h4>Create Backup</h4>
            <p>Export all data to a backup file</p>
          </div>
          <button class="btn btn-primary">Create Backup</button>
        </div>

        <div class="backup-card">
          <div class="backup-icon">📤</div>
          <div class="backup-info">
            <h4>Restore Data</h4>
            <p>Import data from a backup file</p>
          </div>
          <button class="btn btn-secondary">Restore</button>
        </div>

        <div class="backup-card">
          <div class="backup-icon">📊</div>
          <div class="backup-info">
            <h4>Export Reports</h4>
            <p>Export all reports and analytics</p>
          </div>
          <button class="btn btn-secondary">Export</button>
        </div>
      </div>

      <div class="last-backup">
        <span class="backup-label">Last Backup:</span>
        <span class="backup-date">December 4, 2025 at 11:30 PM</span>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel { padding: 24px; }
    .panel-header { margin-bottom: 24px; }
    .panel-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
    .panel-description { color: var(--text-secondary); font-size: 0.875rem; }

    .backup-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .backup-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; transition: all 0.2s; }
    .backup-card:hover { border-color: var(--primary-color); transform: translateY(-2px); }
    .backup-icon { font-size: 2.5rem; margin-bottom: 0.5rem; background: var(--bg-primary); width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .backup-info h4 { margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600; }
    .backup-info p { margin: 0; color: var(--text-secondary); font-size: 0.875rem; }
    
    .last-backup { margin-top: 2rem; padding: 1rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; gap: 0.5rem; justify-content: center; font-size: 0.875rem; }
    .backup-label { font-weight: 600; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; width: 100%; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); }
  `]
})
export class BackupComponent { }
