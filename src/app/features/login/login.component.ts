import { Component, ChangeDetectorRef } from '@angular/core';
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Please enter your username';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Force check after setting loading

    try {
      const result = await this.authService.login(this.username, this.password);

      if (result.success) {
        this.successMessage = result.message;
        this.cdr.detectChanges(); // Check after success message

        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      } else {
        this.errorMessage = result.message;
        this.isLoading = false;
        this.cdr.detectChanges(); // Check after error
      }
    } catch (error) {
      console.error('Login component error:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
      this.cdr.detectChanges(); // Check after catch
    }
  }
}
