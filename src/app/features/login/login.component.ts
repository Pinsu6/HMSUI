import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Return URL store karo
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.username.trim()) {
      this.errorMessage = 'Please enter your username';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password';
      return;
    }

    this.isLoading = true;

    // Static login - hardcoded credentials check
    const validUsername = 'whitepearl';
    const validPassword = 'whitepearl1234#';

    if (this.username.trim() === validUsername && this.password === validPassword) {
      this.successMessage = 'Login successful! Redirecting...';

      // Store user data in localStorage for session (same key as AuthService)
      const userData = { userId: 1, name: validUsername, role: 'Admin' };
      localStorage.setItem('hotel_auth_user', JSON.stringify(userData));

      // Update AuthService signals for proper authentication state
      this.authService.currentUser.set(userData);
      this.authService.isLoggedIn.set(true);

      // Small delay for success animation
      setTimeout(() => {
        this.router.navigate([this.returnUrl]);
      }, 500);
    } else {
      this.errorMessage = 'Invalid username or password';
      this.isLoading = false;
    }
  }
}
