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
    // Agar already logged in hai, to dashboard pe bhej do
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

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

    try {
      const result = await this.authService.login(this.username.trim(), this.password);

      if (result.success) {
        this.successMessage = result.message;

        // Small delay for success animation
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      } else {
        this.errorMessage = result.message;
        this.isLoading = false;
      }
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred';
      this.isLoading = false;
    }
  }
}
