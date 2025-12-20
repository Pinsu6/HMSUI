import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // User already logged in hai, dashboard pe bhejo
      this.router.navigate(['/dashboard']);
      return false;
    }

    // User logged in nahi hai, login page access karne do
    return true;
  }
}
