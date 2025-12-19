import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RoomManagementComponent } from './features/room-management/room-management.component';
import { CustomerManagementComponent } from './features/customer-management/customer-management.component';
import { CheckInComponent } from './features/check-in/check-in.component';
import { CheckOutComponent } from './features/check-out/check-out.component';
import { BillingComponent } from './features/billing/billing.component';
import { ReportsComponent } from './features/reports/reports.component';
import { SettingsComponent } from './features/settings/settings.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { dashboardResolver } from './core/resolvers/dashboard.resolver';
import { roomManagementResolver } from './core/resolvers/room-management.resolver';
import { customerManagementResolver } from './core/resolvers/customer-management.resolver';
import { checkInResolver } from './core/resolvers/check-in.resolver';
import { checkOutResolver } from './core/resolvers/check-out.resolver';
import { WiFiLogsComponent } from './features/wifi-logs/wifi-logs.component';
import { BookingManagementComponent } from './features/booking-management/booking-management.component';
import { BookingDetailsComponent } from './features/booking-management/booking-details/booking-details.component';
import { InvoiceTemplatePreview } from './features/billing/invoice-template-preview/invoice-template-preview';

export const routes: Routes = [
  // Login route - public, bina guard ke
  { path: 'login', component: LoginComponent },

  // Protected routes - sirf login hone ke baad accessible
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, resolve: { data: dashboardResolver } },
      { path: 'rooms', component: RoomManagementComponent, resolve: { data: roomManagementResolver } },
      { path: 'customers', component: CustomerManagementComponent, resolve: { data: customerManagementResolver } },
      { path: 'bookings', component: BookingManagementComponent },
      { path: 'bookings/:id', component: BookingDetailsComponent },
      { path: 'check-in', component: CheckInComponent, resolve: { data: checkInResolver } },
      { path: 'check-out', component: CheckOutComponent, resolve: { data: checkOutResolver } },
      { path: 'billing', component: BillingComponent },
      { path: 'billing/invoice-template', component: InvoiceTemplatePreview },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'wifi-logs', component: WiFiLogsComponent }
    ]
  },

  // Wildcard - koi unknown route ho to login pe redirect
  { path: '**', redirectTo: 'login' }
];
