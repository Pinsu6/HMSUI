import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  userId: number;
  name: string;
  email?: string;
  role: string;
}

// API Response format
interface ApiLoginResponse {
  status: string;
  type: string;
  totalCount: number | null;
  message: string;
  responseData: string; // JSON string containing user array
  token: string | null;
}

export interface UserRegistrationDto {
  UserId?: number;
  Name: string;
  Email: string;
  PasswordHash: string;
  Role: string;
}

// Parsed user data from responseData
interface UserData {
  UserId: number;
  Name: string;
  Email: string;
  Role: string;
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
        this.http.post<ApiLoginResponse>(`${this.API_URL}/login`, { name, password })
      );

      console.log('Login API Response:', response);

      // Check if login was successful
      if (response.status === 'success' && response.responseData) {
        // Parse the responseData JSON string
        const usersArray: UserData[] = JSON.parse(response.responseData);

        if (usersArray && usersArray.length > 0) {
          const apiUser = usersArray[0];

          const userData: User = {
            userId: apiUser.UserId,
            name: apiUser.Name,
            email: apiUser.Email,
            role: apiUser.Role
          };

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
          this.currentUser.set(userData);
          this.isLoggedIn.set(true);

          return { success: true, message: response.message || 'Login successful!' };
        }
      }

      // Login failed
      return { success: false, message: response.message || 'Login failed. Please try again.' };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.error?.message || error.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }

  async addUser(user: UserRegistrationDto): Promise<{ success: boolean; message: string }> {
    try {
      const response: any = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/User/adduser`, user)
      );

      if (response && (response.status === 'success' || response.statusCode === 200)) {
        return { success: true, message: response.message || 'User added successfully!' };
      }
      return { success: false, message: response.message || 'Failed to add user.' };

    } catch (error: any) {
      console.error('Add user error:', error);
      const message = error.error?.message || error.message || 'Failed to add user. Please try again.';
      return { success: false, message };
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const payload = {
        page: 0,
        pageSize: 0,
        sortColumn: '',
        sortDirection: '',
        searchText: ''
      };

      const response: any = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/User/get`, payload)
      );

      const data = response.responseData ? JSON.parse(response.responseData) : response;

      if (Array.isArray(data)) {
        return data.map((u: any) => ({
          userId: u.UserId || u.id,
          name: u.Name || u.name,
          email: u.Email || u.email,
          role: u.Role || u.role
        }));
      }
      return [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
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
