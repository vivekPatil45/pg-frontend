import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
        <p class="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-muted/30 p-6 border-b border-border flex items-center gap-4">
          <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {{ getInitials() }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-foreground">{{ profileForm.get('name')?.value }}</h2>
            <p class="text-sm text-muted-foreground">{{ profileForm.get('email')?.value || user?.email }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
              Tenant
            </span>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="p-6">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                @if (profileForm.get('name')?.touched && profileForm.get('name')?.errors?.['required']) {
                  <p class="text-sm text-destructive">Name is required</p>
                }
              </div>



              <!-- Email (disabled) -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  [attr.disabled]="true"
                />
              </div>

              <!-- Mobile Number -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Mobile Number</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium border-r border-border pr-2">+91</span>
                  <input
                    type="tel"
                    formControlName="phone"
                    placeholder="9876543210"
                    class="flex h-10 w-full rounded-md border border-input bg-background pl-14 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    [class.border-destructive]="profileForm.get('phone')?.touched && profileForm.get('phone')?.invalid"
                  />
                </div>
                @if (profileForm.get('phone')?.touched) {
                  @if (profileForm.get('phone')?.errors?.['pattern']) {
                    <p class="text-sm text-destructive">Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.</p>
                  }
                }
              </div>

              <!-- Address -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium text-foreground">Address</label>
                <textarea
                  formControlName="address"
                  rows="3"
                  class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
              </div>
            </div>
            
            @if (message) {
                <div [class]="'p-3 rounded-md text-sm ' + (isError ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700')">
                    {{ message }}
                </div>
            }

            <div class="flex justify-end pt-4 border-t border-border">
              <app-button type="submit" [disabled]="profileForm.invalid || isLoading || !profileForm.dirty">
                @if (isLoading) {
                  <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
                  Saving...
                } @else {
                  Save Changes
                }
              </app-button>
            </div>
          </form>
        </div>
      </div>

       <!-- Security Section -->
       <div class="bg-card rounded-xl border border-border overflow-hidden mt-6 p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Security</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-foreground">Logout</p>
              <p class="text-sm text-muted-foreground"> securely log out of the system</p>
            </div>
            <app-button variant="destructive" size="sm" (click)="logout()">Logout</app-button>
          </div>
       </div>
    </div>
  `,
  styles: []
})
export class TenantProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  user: User | null = null;
  message: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      address: ['']
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          this.user = user;
          // Prefer fetching fresh profile data from API
          return this.tenantService.getProfile(user.userId!).pipe(
            switchMap((apiResponse: any) => {
              if (apiResponse.success && apiResponse.data) {
                return of({ success: true, data: apiResponse.data });
              }
              return of({ success: true, data: user }); // Fallback to session user
            }),
            // Catch error in fetching profile and fall back to session user
            switchMap(res => of(res))
          );
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          const userData = response.data;
          this.user = userData;

          // Split stored phone (e.g. "+91-9876543210" or "9876543210") into parts
          let phone = userData.phone || '';
          if (phone.includes('-')) {
            phone = phone.split('-')[1] || '';
          } else if (phone.startsWith('+91')) {
            phone = phone.substring(3);
          }
          // Remove any non-digits that might have slipped in
          phone = phone.replace(/\D/g, '');

          this.profileForm.patchValue({
            name: userData.name,
            email: userData.email,
            phone,
            address: userData.address || ''
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching profile', err);
        // Even if fetch fails, we might have user from session
        if (this.user) {
          this.profileForm.patchValue({
            name: this.user.name,
            email: this.user.email
          });
        }
      }
    });
  }

  getInitials(): string {
    const name = this.profileForm.get('name')?.value || this.user?.name || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onSubmit() {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      this.message = '';
      this.isError = false;

      const phone = this.profileForm.get('phone')?.value || '';
      const updateData: Partial<User> = {
        name: this.profileForm.get('name')?.value,
        phone, // Just send the 10 digit number, backend will handle or we prepend if needed
        address: this.profileForm.get('address')?.value
      };

      this.tenantService.updateProfile(this.user.userId!, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Profile updated successfully!';
          this.profileForm.markAsPristine();

          // Update auth service with new data to keep session in sync
          if (response.data) {
            this.authService.updateSession(response.data);
            this.user = { ...this.user!, ...response.data };
          } else {
            // Fallback if backend doesn't return full object
            this.authService.updateSession(updateData);
            this.user = { ...this.user!, ...updateData };
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.message = err.error?.message || 'Failed to update profile.';
          this.isError = true;
          console.error('Profile update error', err);
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/auth/login';
    });
  }
}
