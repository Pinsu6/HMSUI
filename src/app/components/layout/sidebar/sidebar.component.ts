import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
}
