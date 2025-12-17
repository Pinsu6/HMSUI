import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentDate = new Date();

  currentUser = {
    name: 'Whitepearl',
    role: 'admin',
    avatar: 'W'
  };

  notifications: any[] = [];

  showNotifications = false;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
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

  ngOnInit() {
    this.loadNotifications();
  }

  async loadNotifications() {
    try {
      const data = await this.notificationService.getNotifications();
      this.notifications = data.map(n => ({
        id: n.bookingId,
        message: `${n.notificationMessage} (Room ${n.roomNumber})`,
        time: this.formatDate(n.expectedCheckOutTime),
        type: this.getNotificationType(n.notificationType)
      }));
    } catch (error) {
      console.error('Error loading notifications', error);
    }
  }

  getNotificationType(type: string): string {
    switch (type) {
      case 'TODAY_CHECKOUT': return 'info';
      case 'CLEANING_PENDING': return 'warning';
      case 'OVERDUE_CHECKOUT': return 'alert';
      default: return 'info';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    // Optionally refresh notifications when opening
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  async markAllRead() {
    if (this.notifications.length === 0) return;

    try {
      // Create an array of promises to mark all as read
      const promises = this.notifications.map(n => this.notificationService.markAsRead(n.id));
      await Promise.all(promises);

      // Refresh notifications (should be empty now)
      this.loadNotifications();
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  }

  async onNotificationClick(notification: any) {
    try {
      await this.notificationService.markAsRead(notification.id);
      this.loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
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
