import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  userId: number;
  name: string;
  role: string;
}

interface LoginResponse {
  userId: number;
  name: string;
  role: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'hotel_auth_user';
  private readonly API_URL = `${environment.apiUrl}/Login`;

  // Using signals for reactive state
  currentUser = signal<User | null>(this.getStoredUser());
  isLoggedIn = signal<boolean>(this.checkLoginStatus());

  constructor(private router: Router, private http: HttpClient) { }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private checkLoginStatus(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  async login(name: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API_URL}/login`, { name, password })
      );

      const userData: User = {
        userId: response.userId,
        name: response.name,
        role: response.role
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      this.currentUser.set(userData);
      this.isLoggedIn.set(true);

      return { success: true, message: response.message };
    } catch (error: any) {
      const message = error.error?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
}

