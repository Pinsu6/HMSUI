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
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">👥 User Management</h2>
          <p class="panel-description">Manage system users and their roles</p>
        </div>
        <button class="btn btn-primary" (click)="showAddUserModal = true">
          ➕ Add User
        </button>
      </div>

      <div class="users-table">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-info">
                  <span class="user-avatar">{{ user.name.charAt(0) }}</span>
                  <div>
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" [class]="user.role.toLowerCase()">{{ user.role }}</span>
              </td>
              <td>
                <span class="status-badge" [class]="user.status">{{ user.status }}</span>
              </td>
              <td>{{ user.lastLogin }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-ghost" title="Edit">✏️</button>
                  <button class="btn btn-sm btn-ghost" title="Toggle Status" (click)="toggleUserStatus(user)">
                    {{ user.status === 'active' ? '🔒' : '🔓' }}
                  </button>
                  <button class="btn btn-sm btn-ghost" title="Delete" (click)="deleteUser(user)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="roles-info">
        <h4>Role Permissions</h4>
        <div class="role-card">
          <span class="role-name admin">Admin</span>
          <span class="role-desc">Full access to all features including user management and settings</span>
        </div>
        <div class="role-card">
          <span class="role-name manager">Manager</span>
          <span class="role-desc">All features except user creation and system settings</span>
        </div>
        <div class="role-card">
          <span class="role-name receptionist">Receptionist</span>
          <span class="role-desc">Check-in, check-out, add charges, and view dashboard</span>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal-overlay" [class.active]="showAddUserModal" (click)="showAddUserModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Add New User</h3>
          <button class="btn btn-icon btn-ghost" (click)="showAddUserModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" [(ngModel)]="newUser.name" placeholder="Enter full name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" [(ngModel)]="newUser.email" placeholder="Enter email address">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" [(ngModel)]="newUser.password" placeholder="Enter password">
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-select" [(ngModel)]="newUser.role">
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showAddUserModal = false">Cancel</button>
          <button class="btn btn-primary" (click)="addUser()">Add User</button>
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

    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .user-name { font-weight: 500; display: block; }
    .user-email { font-size: 0.75rem; color: var(--text-secondary); }

    .role-badge { padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
    .role-badge.admin { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .role-badge.manager { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .role-badge.receptionist { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

    .status-badge { padding: 0.25rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500; }
    .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .status-badge.inactive { background: rgba(100, 116, 139, 0.1); color: #64748b; }

    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-weight: 500; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
    .btn-ghost { background: transparent; color: var(--text-secondary); padding: 0.25rem; }
    .btn-icon { padding: 0.5rem; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; border-radius: 50%; width: 32px; height: 32px; border: none; cursor: pointer; }

    .action-buttons { display: flex; gap: 0.5rem; }

    .roles-info { margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 0.75rem; }
    .role-card { margin-top: 1rem; display: flex; align-items: center; gap: 1rem; }
    .role-name { font-weight: 600; min-width: 100px; }
    .role-desc { color: var(--text-secondary); font-size: 0.875rem; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.2s; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .modal { background: var(--bg-primary); border-radius: 0.75rem; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); transform: scale(0.95); transition: all 0.2s; }
    .modal-overlay.active .modal { transform: scale(1); }
    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { padding: 1rem 1.5rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }

    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
    .form-input, .form-textarea, .form-select { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-primary); color: var(--text-primary); transition: all 0.2s; }
  `]
})
export class UserManagementComponent {
  users: User[] = [];
  showAddUserModal = false;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'Receptionist' as const
  };

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
    if (confirm(`Are you sure you want to delete \${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }
}
