import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { getErrorMessage } from '../../../shared/utils/error.util';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-foreground">Change Password</h2>
        <p class="text-muted-foreground mt-2">Please update your password to continue</p>
      </div>

      @if (error) {
        <div class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ error }}</span>
        </div>
      }

      @if (successMessage) {
        <div class="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm">{{ successMessage }}</span>
        </div>
      }

      <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Current Password -->
        <div class="space-y-2">
          <label for="currentPassword" class="text-sm font-medium text-foreground block">
            Current Password <span class="text-destructive">*</span>
          </label>
          <input
            id="currentPassword"
            type="password"
            formControlName="currentPassword"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Enter current password"
          />
          @if (changePasswordForm.get('currentPassword')?.touched && changePasswordForm.get('currentPassword')?.errors?.['required']) {
            <p class="text-sm text-destructive">Current password is required</p>
          }
        </div>

        <!-- New Password -->
        <div class="space-y-2">
          <label for="newPassword" class="text-sm font-medium text-foreground block">
            New Password <span class="text-destructive">*</span>
          </label>
          <input
            id="newPassword"
            type="password"
            formControlName="newPassword"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Enter new password"
          />
          @if (changePasswordForm.get('newPassword')?.touched) {
            @if (changePasswordForm.get('newPassword')?.errors?.['required']) {
              <p class="text-sm text-destructive">New password is required</p>
            }
            @if (changePasswordForm.get('newPassword')?.errors?.['pattern']) {
              <p class="text-sm text-destructive">Password must be at least 8 chars with uppercase, lowercase, number & special char</p>
            }
          }
        </div>

        <!-- Confirm New Password -->
        <div class="space-y-2">
          <label for="confirmNewPassword" class="text-sm font-medium text-foreground block">
            Confirm New Password <span class="text-destructive">*</span>
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            formControlName="confirmNewPassword"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Confirm new password"
          />
          @if (changePasswordForm.get('confirmNewPassword')?.touched) {
            @if (changePasswordForm.get('confirmNewPassword')?.errors?.['required']) {
              <p class="text-sm text-destructive">Confirm password is required</p>
            }
            @if (changePasswordForm.errors?.['mismatch']) {
              <p class="text-sm text-destructive">Passwords do not match</p>
            }
          }
        </div>

        <div class="mt-4">
          <app-button 
            type="submit" 
            [disabled]="changePasswordForm.invalid || isLoading"
            className="w-full h-11"
            size="lg"
          >
            @if (isLoading) {
              <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
              Updating Password...
            } @else {
              Update Password
            }
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  isLoading = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';

      const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

      this.authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Password updated successfully. Redirecting...';

            // Update local user state
            this.authService.updateSession({ requirePasswordChange: false });

            setTimeout(() => {
              const user = this.authService.getCurrentUser();
              if (user) {
                if (user.role === 'TENANT') {
                  this.router.navigate(['/tenant/home']);
                } else if (user.role === 'ADMIN' || user.role === 'OWNER') {
                  this.router.navigate(['/admin/dashboard']);
                } else {
                  this.router.navigate(['/']);
                }
              }
            }, 1500);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = getErrorMessage(err, 'Failed to update password');
        }
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }
}
