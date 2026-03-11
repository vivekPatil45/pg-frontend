import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../shared/utils/error.util';

const COUNTRY_RULES: Record<string, { min: number; max: number; label: string; placeholder: string }> = {
  '+91': { min: 10, max: 10, label: 'India', placeholder: '9876543210' },
};

function mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
  const num = control.value as string;
  if (!num) return null;
  const digits = num.replace(/\D/g, '');

  if (digits.length !== 10) {
    return { invalidMobile: true };
  }

  if (!/^[6-9]/.test(digits)) {
    return { invalidMobilePrefix: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="animate-fade-in max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-sm border border-border">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-foreground">Tenant Registration</h2>
        <p class="text-muted-foreground mt-2">Create your account to access our booking system</p>
      </div>

      <!-- Error Message -->
      @if (error) {
        <div class="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive animate-shake">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">{{ error }}</span>
        </div>
      }

      <!-- Register Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- Name -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-foreground block">
            Full Name <span class="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="User name"
            [class.border-destructive]="isFieldInvalid('name')"
          />
          @if (isFieldInvalid('name')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('name') }}</p>
          }
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-foreground block">
            Email <span class="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="user@gmail.com"
            [class.border-destructive]="isFieldInvalid('email')"
          />
          @if (isFieldInvalid('email')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('email') }}</p>
          }
        </div>

        <!-- Mobile Number -->
        <div class="space-y-2">
          <label for="mobileNumber" class="text-sm font-medium text-foreground block">
            Mobile Number <span class="text-destructive">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium border-r border-border pr-2">+91</span>
            <input
                id="mobileNumber"
                type="tel"
                formControlName="mobileNumber"
                class="flex h-11 w-full rounded-md border border-input bg-background pl-14 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                placeholder="9876543210"
                [class.border-destructive]="isMobileInvalid()"
            />
          </div>
          @if (isMobileInvalid()) {
            <p class="text-sm text-destructive mt-1">{{ getMobileErrorMessage() }}</p>
          }
        </div>

        <!-- ID Proof -->
        <div class="space-y-2">
          <label for="idProof" class="text-sm font-medium text-foreground block">
            Aadhaar Number <span class="text-destructive">*</span>
          </label>
          <input
            id="idProof"
            type="text"
            formControlName="idProof"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Enter your 12-digit Aadhaar number"
            [class.border-destructive]="isFieldInvalid('idProof')"
          />
          @if (isFieldInvalid('idProof')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('idProof') }}</p>
          }
        </div>



        <!-- Password -->
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-foreground block">
            Password <span class="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Create a strong password"
            [class.border-destructive]="isFieldInvalid('password')"
          />
          @if (isFieldInvalid('password')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('password') }}</p>
          }
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <label for="confirmPassword" class="text-sm font-medium text-foreground block">
            Confirm Password <span class="text-destructive">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            formControlName="confirmPassword"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Confirm your password"
            [class.border-destructive]="isFieldInvalid('confirmPassword')"
          />
          @if (isFieldInvalid('confirmPassword')) {
            <p class="text-sm text-destructive mt-1">{{ getErrorMessage('confirmPassword') }}</p>
          }
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
            <button 
                type="button" 
                (click)="onReset()"
                class="flex-1 h-11 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                Reset
            </button>
            
            <app-button 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading"
                className="flex-1 h-11"
                size="lg"
            >
                @if (isLoading) {
                    <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
                    Registering...
                } @else {
                    Register
                }
            </app-button>
        </div>
      </form>

      <!-- Login Link -->
      <p class="mt-8 text-center text-sm text-muted-foreground">
        Already have an account? 
        <a routerLink="/auth/login" class="text-primary font-medium hover:underline ml-1">
          Login Now
        </a>
      </p>
    </div>
    `,
  styles: []
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  error = '';
  mobilePlaceholder = '9876543210';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z\\s]+$')
      ]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        mobileNumberValidator
      ]],
      idProof: ['', [
        Validators.required,
        Validators.pattern('^[2-9][0-9]{11}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator] });
  }

  ngOnInit(): void {
  }

  onCountryChange(): void {
  }

  isMobileInvalid(): boolean {
    const field = this.registerForm.get('mobileNumber');
    const touched = field?.dirty || field?.touched;
    return !!(touched && (field?.invalid || field?.errors?.['invalidMobile'] || field?.errors?.['invalidMobilePrefix']));
  }

  getMobileErrorMessage(): string {
    const field = this.registerForm.get('mobileNumber');

    if (field?.errors?.['required']) {
      return 'Mobile number is required.';
    }
    if (field?.errors?.['pattern']) {
      return 'Please enter digits only — no spaces, dashes, or special characters.';
    }
    if (field?.errors?.['invalidMobilePrefix']) {
      return 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.';
    }
    if (field?.errors?.['invalidMobile']) {
      return `Please enter a valid 10-digit Indian mobile number.`;
    }
    return 'Please enter a valid Indian mobile number.';
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (fieldName === 'name') {
      if (field.errors['required']) return 'Name is required';
      if (field.errors['minlength']) return 'Name must be at least 3 characters long';
      if (field.errors['pattern']) return 'Name must contain only letters';
    }

    if (fieldName === 'email') {
      if (field.errors['required']) return 'Email is required';
      if (field.errors['email']) return 'Enter a valid email address';
    }

    if (fieldName === 'mobileNumber') {
      if (field.errors['required']) return 'Mobile number is required';
      if (field.errors['pattern']) return 'Enter a valid mobile number (8-10 digits)';
    }



    if (fieldName === 'idProof') {
      if (field.errors['required']) return 'Aadhaar Number is required';
      if (field.errors['pattern']) return 'Please enter a valid 12-digit Aadhaar number';
    }

    if (fieldName === 'password') {
      if (field.errors['required']) return 'Password is required';
      if (field.errors['minlength']) return 'Password must be at least 8 characters';
      if (field.errors['pattern']) return 'Password must include uppercase, lowercase, number, and special char';
    }

    if (fieldName === 'confirmPassword') {
      if (field.errors['required']) return 'Confirm Password is required';
      if (this.registerForm.errors?.['passwordMismatch']) return 'Passwords do not match';
    }

    return '';
  }

  onReset(): void {
    this.registerForm.reset();
    this.error = '';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const formValue = this.registerForm.value;

      // Format data for backend
      const registerData: RegisterData = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.mobileNumber, // Already standardized to 10 digits
        idProof: formValue.idProof,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        address: 'Not provided'
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('Registration successful! Please log in to continue. 🎉');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = getErrorMessage(err, 'Registration failed. Please check your inputs and try again.');
          console.error('Registration error details:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
