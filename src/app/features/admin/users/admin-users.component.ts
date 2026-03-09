import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal.component';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse } from '../../../models/user-management.model';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">User Accounts</h1>
          <p class="text-muted-foreground mt-1">Manage all user accounts and their access</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadUsers(0)"
              placeholder="Search users..."
              class="h-9 w-48 pl-9 pr-3 rounded-md border border-input bg-background text-sm">
          </div>
          <select [(ngModel)]="roleFilter" (change)="loadUsers(0)"
            class="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Roles</option>
            <option value="TENANT">Tenant</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>
          <app-button size="sm" (click)="openCreateModal()">+ Create User</app-button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else {
        <div class="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muted/50 border-b border-border">
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">User</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Phone</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Role</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Joined</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (user of users; track user.userId) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {{ getInitials(user.name) }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-foreground">{{ user.name }}</p>
                          <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ user.phone || '—' }}</td>
                    <td class="py-3 px-4">
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span [class]="user.status === 'ACTIVE' ? 'text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium' : 'text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium'">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-muted-foreground">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="py-3 px-4 text-right flex justify-end gap-2">
                      <app-button variant="outline" size="sm" (click)="resetPassword(user)">Reset Pwd</app-button>
                      @if (user.status === 'ACTIVE') {
                        <app-button variant="outline" size="sm" (click)="deactivateUser(user)">Deactivate</app-button>
                      } @else {
                        <app-button size="sm" (click)="activateUser(user)">Activate</app-button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-muted-foreground">No users found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (totalPages > 1) {
          <div class="flex justify-center gap-2 mt-4">
            <app-button variant="outline" size="sm" [disabled]="currentPage === 0" (click)="loadUsers(currentPage - 1)">Previous</app-button>
            <span class="px-4 py-2 text-sm text-muted-foreground flex items-center">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <app-button variant="outline" size="sm" [disabled]="currentPage === totalPages - 1" (click)="loadUsers(currentPage + 1)">Next</app-button>
          </div>
        }
      }
    </div>

    <!-- Success Modal -->
    <app-modal [isOpen]="isSuccessModalOpen" title="Account Created / Password Reset" size="sm" (close)="closeSuccessModal()">
      <div class="space-y-4 py-2">
        <div class="flex flex-col items-center justify-center text-center space-y-2">
          <div class="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground">Action Successful</h3>
          <p class="text-sm text-muted-foreground">Please share these login credentials with <strong>{{ successUserEmail }}</strong></p>
        </div>

        <div class="bg-muted p-4 rounded-lg space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated Password</span>
            <button (click)="copyToClipboard(generatedPassword)" class="text-xs text-primary hover:underline">Copy</button>
          </div>
          <p class="text-xl font-mono font-bold tracking-wider text-center py-2 border-2 border-dashed border-border rounded bg-background select-all">
            {{ generatedPassword }}
          </p>
        </div>
        
        <p class="text-xs text-center text-muted-foreground italic">
          User will be required to change this password on their first login.
        </p>

        <div class="pt-2">
          <app-button className="w-full" (click)="closeSuccessModal()">Close</app-button>
        </div>
      </div>
    </app-modal>

    <!-- Create User Modal -->
    <app-modal [isOpen]="isCreateModalOpen" title="Create New User" size="md" (close)="closeCreateModal()">
      <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
        <div class="space-y-4 p-1">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Full Name *</label>
            <input formControlName="name" type="text" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="John Doe">
            @if (createForm.get('name')?.invalid && createForm.get('name')?.touched) {
              <span class="text-xs text-destructive">Name is required.</span>
            }
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Email *</label>
            <input formControlName="email" type="email" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="john@example.com">
            @if (createForm.get('email')?.invalid && createForm.get('email')?.touched) {
              <span class="text-xs text-destructive">Valid email is required.</span>
            }
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Phone *</label>
            <input formControlName="phone" type="tel" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="+91-9999999999">
            @if (createForm.get('phone')?.invalid && createForm.get('phone')?.touched) {
              <span class="text-xs text-destructive">Phone is required.</span>
            }
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Role *</label>
            <select formControlName="role" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="TENANT">Tenant</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        @if (createError) {
          <div class="mt-3 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
            {{ createError }}
          </div>
        }

        <div class="mt-6 flex justify-end gap-3">
          <app-button variant="ghost" type="button" (click)="closeCreateModal()" [disabled]="isCreating">Cancel</app-button>
          <app-button type="submit" [disabled]="isCreating">
            @if (isCreating) { <span>Creating...</span> } @else { <span>Create User</span> }
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Confirm Password Reset Modal -->
    <app-confirm-modal
      [isOpen]="isConfirmModalOpen"
      title="Reset Password"
      [message]="'Are you sure you want to reset the password for ' + (selectedUserForAction?.name || 'this user') + '?'"
      confirmText="Reset Password"
      (confirm)="onConfirmResetPassword()"
      (cancel)="closeConfirmModal()"
    ></app-confirm-modal>
  `,
  styles: []
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  isLoading = false;
  searchQuery = '';
  roleFilter = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  isCreateModalOpen = false;
  isSuccessModalOpen = false;
  isConfirmModalOpen = false;
  isCreating = false;
  createError = '';
  generatedPassword = '';
  successUserEmail = '';
  selectedUserForAction: UserResponse | null = null;
  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminUserService: AdminUserService,
    private toastService: ToastService
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['TENANT', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    this.isLoading = true;
    this.currentPage = page;
    const role = this.roleFilter ? this.roleFilter as UserRole : undefined;
    this.adminUserService.getAllUsers(page, this.pageSize, this.searchQuery || undefined, role).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data.users;
          this.totalPages = response.data.totalPages ?? 1;
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  openCreateModal() {
    this.createForm.reset({ name: '', email: '', phone: '', password: '', role: 'TENANT' });
    this.createError = '';
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.createError = '';
  }

  onCreateSubmit() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isCreating = true;
    this.createError = '';
    this.adminUserService.createUser(this.createForm.value).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.generatedPassword = response.data.generatedPassword || '';
          this.successUserEmail = response.data.email;
          this.isSuccessModalOpen = true;
        }
        this.closeCreateModal();
        this.loadUsers(0);
        this.isCreating = false;
      },
      error: (err) => {
        this.createError = err.error?.message || 'Failed to create user.';
        this.isCreating = false;
      }
    });
  }

  resetPassword(user: UserResponse) {
    this.selectedUserForAction = user;
    this.isConfirmModalOpen = true;
  }

  onConfirmResetPassword() {
    if (!this.selectedUserForAction) return;

    this.adminUserService.resetPassword(this.selectedUserForAction.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.generatedPassword = response.data.newPassword;
          this.successUserEmail = response.data.email;
          this.isSuccessModalOpen = true;
        }
        this.closeConfirmModal();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to reset password.');
        this.closeConfirmModal();
      }
    });
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.selectedUserForAction = null;
  }

  closeSuccessModal() {
    this.isSuccessModalOpen = false;
    this.generatedPassword = '';
    this.successUserEmail = '';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success('Password copied to clipboard!');
    });
  }

  activateUser(user: UserResponse) {
    this.adminUserService.activateUser(user.userId).subscribe({
      next: () => {
        this.toastService.success(`${user.name} has been activated.`);
        this.loadUsers(this.currentPage);
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to activate user.')
    });
  }

  deactivateUser(user: UserResponse) {
    this.adminUserService.deactivateUser(user.userId).subscribe({
      next: () => {
        this.toastService.success(`${user.name} has been deactivated.`);
        this.loadUsers(this.currentPage);
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to deactivate user.')
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-destructive/10 text-destructive',
      TENANT: 'bg-primary/10 text-primary',
      STAFF: 'bg-warning/10 text-warning',
    };
    return map[role] ?? 'bg-muted text-foreground';
  }
}
