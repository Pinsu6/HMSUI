import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  currentDate = new Date();

  currentUser = {
    name: 'Whitepearl',
    role: 'admin',
    avatar: 'W'
  };

  notifications = [
    { id: 1, message: 'Room 205 checkout pending', time: '5 min ago', type: 'warning' },
    { id: 2, message: 'New booking received', time: '10 min ago', type: 'info' },
    { id: 3, message: 'Room 108 needs cleaning', time: '15 min ago', type: 'alert' }
  ];

  showNotifications = false;
  showUserMenu = false;

  constructor(private authService: AuthService) {
    // Initialize user info from AuthService
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser = {
        name: user.name || 'Whitepearl',
        role: user.role || 'admin',
        avatar: (user.name || 'W').charAt(0).toUpperCase()
      };
    }

    // Update user info when it changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.currentUser = {
          name: user.name || 'Whitepearl',
          role: user.role || 'admin',
          avatar: (user.name || 'W').charAt(0).toUpperCase()
        };
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
  }
}
