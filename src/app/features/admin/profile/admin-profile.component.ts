import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-admin-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ModalComponent],
    template: `
    <div class="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
        <p class="text-muted-foreground mt-1">Manage your admin account details and password</p>
      </div>

      @if (currentUser) {
        <!-- Profile Card -->
        <div class="bg-card rounded-xl border border-border p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {{ getInitials(currentUser.name) }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">{{ currentUser.name }}</h2>
              <p class="text-muted-foreground">{{ currentUser.email }}</p>
              <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                {{ currentUser.role }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <p class="text-muted-foreground">Phone</p>
              <p class="font-medium text-foreground mt-0.5">{{ currentUser.phone || 'Not set' }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">User ID</p>
              <p class="font-mono text-xs text-foreground mt-0.5 truncate">{{ currentUser.userId }}</p>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-lg text-foreground mb-4">Change Password</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Current Password *</label>
              <input
                formControlName="currentPassword"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter current password"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">New Password *</label>
              <input
                formControlName="newPassword"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Minimum 6 characters"
              >
              @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
                <span class="text-xs text-destructive">Minimum 6 characters required.</span>
              }
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Confirm New Password *</label>
              <input
                formControlName="confirmPassword"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Re-enter new password"
              >
              @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched) {
                <span class="text-xs text-destructive">Passwords do not match.</span>
              }
            </div>

            @if (passwordError) {
              <div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {{ passwordError }}
              </div>
            }

            <div class="flex justify-end">
              <app-button type="submit" [disabled]="isChangingPassword || passwordForm.invalid">
                @if (isChangingPassword) { <span>Changing...</span> } @else { <span>Change Password</span> }
              </app-button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
    styles: []
})
export class AdminProfileComponent implements OnInit {
    currentUser: User | null = null;
    passwordForm: FormGroup;
    isChangingPassword = false;
    passwordError = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    passwordMatchValidator(group: FormGroup) {
        const pw = group.get('newPassword')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pw === confirm ? null : { mismatch: true };
    }

    changePassword() {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }
        this.isChangingPassword = true;
        this.passwordError = '';

        const { currentPassword, newPassword } = this.passwordForm.value;
        this.authService.changePassword({ currentPassword, newPassword }).subscribe({
            next: () => {
                this.toastService.success('Password changed successfully.');
                this.passwordForm.reset();
                this.isChangingPassword = false;
            },
            error: (err) => {
                this.passwordError = err.error?.message || 'Failed to change password.';
                this.isChangingPassword = false;
            }
        });
    }

    getInitials(name: string): string {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
}
