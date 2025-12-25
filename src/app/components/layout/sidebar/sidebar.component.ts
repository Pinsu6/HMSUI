import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  isCollapsed = false;

  userRole = computed(() => this.authService.currentUser()?.role);

  allMenuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard' },
    { icon: '🛏️', label: 'Room Management', route: '/rooms' },
    { icon: '👥', label: 'Customer Management', route: '/customers' },
    { icon: '📅', label: 'Booking Management', route: '/bookings' },
    { icon: '📝', label: 'Check-In', route: '/check-in' },
    { icon: '🚪', label: 'Check-Out', route: '/check-out' },
    {
      icon: '💵',
      label: 'Billing & Invoice',
      route: '/billing',
      children: [
        { icon: '', label: 'Invoice Template', route: '/billing/invoice-template' }
      ]
    },
    { icon: '📈', label: 'Reports', route: '/reports' },
    { icon: '📡', label: 'WiFi Logs', route: '/wifi-logs' },
    { icon: '⚙️', label: 'Settings', route: '/settings' }
  ];

  filteredMenuItems = computed(() => {
    const role = this.userRole();
    if (role === 'Receptionist') {
      // Receptionist: Check-in, check-out, add charges (via bookings), view dashboard
      const allowedRoutes = ['/dashboard', '/bookings', '/check-in', '/check-out'];
      return this.allMenuItems.filter(item => allowedRoutes.includes(item.route));
    }
    // Admin & Manager see everything (Manager restrictions are inside Settings)
    return this.allMenuItems;
  });

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
}
