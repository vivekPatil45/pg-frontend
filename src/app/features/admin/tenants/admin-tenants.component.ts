import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal.component';
import { AdminTenantService, TenantResponse } from '../../../core/services/admin-tenant.service';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminBedService, Bed } from '../../../core/services/admin-bed.service';
import { ToastService } from '../../../core/services/toast.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Tenant Management</h1>
          <p class="text-muted-foreground mt-1">Manage PG residents, room assignments, and check-outs</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-64">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadTenants()"
              placeholder="Search by name, email, phone..."
              class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <select [(ngModel)]="filterStatus" (change)="loadTenants()" class="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
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
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Tenant</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Contact</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room/Bed</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Check-in Date</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID Proof</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (tenant of tenants; track tenant.tenantId) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {{ getInitials(tenant.name) }}
                        </div>
                        <div class="font-medium text-foreground">{{ tenant.name }}</div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="text-sm text-foreground">{{ tenant.email }}</div>
                      <div class="text-xs text-muted-foreground">{{ tenant.phone }}</div>
                    </td>
                    <td class="py-3 px-4">
                      @if (tenant.roomNumber) {
                        <div class="text-sm font-medium text-foreground">Room {{ tenant.roomNumber }}</div>
                        <div class="text-xs text-muted-foreground">Bed {{ tenant.bedNumber }}</div>
                      } @else {
                        <span class="text-xs text-muted-foreground italic">Not Assigned</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                      {{ tenant.checkInDate ? (tenant.checkInDate | date:'mediumDate') : 'N/A' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground truncate max-w-[100px]" [title]="tenant.idProof || 'N/A'">
                      {{ tenant.idProof || 'N/A' }}
                    </td>
                    <td class="py-3 px-4">
                      <span [class]="getStatusClass(tenant.status)">{{ tenant.status }}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex justify-end gap-1">
                        <app-button variant="ghost" size="sm" (click)="openEditModal(tenant)">Edit</app-button>
                        @if (!tenant.roomNumber && tenant.status === 'ACTIVE') {
                          <app-button variant="ghost" size="sm" class="text-primary" (click)="openAssignModal(tenant)">Assign</app-button>
                        }
                        @if (tenant.status === 'ACTIVE' && tenant.roomNumber) {
                          <app-button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" (click)="onCheckOut(tenant)">Check Out</app-button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-muted-foreground">No tenants found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex justify-center gap-2 mt-4">
            <app-button variant="outline" size="sm" [disabled]="currentPage === 0" (click)="loadPage(currentPage - 1)">Previous</app-button>
            <span class="px-4 py-2 text-sm text-muted-foreground flex items-center">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <app-button variant="outline" size="sm" [disabled]="currentPage === totalPages - 1" (click)="loadPage(currentPage + 1)">Next</app-button>
          </div>
        }
      }
    </div>

    <!-- Edit Tenant Modal -->
    <app-modal
      [isOpen]="isEditModalOpen"
      [title]="'Edit Tenant - ' + selectedTenant?.name"
      size="md"
      (close)="isEditModalOpen = false"
    >
      <form [formGroup]="editForm" (ngSubmit)="onUpdate()">
        <div class="space-y-4 p-1">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Full Name</label>
            <input type="text" formControlName="name" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Phone Number</label>
            <input type="text" formControlName="phone" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">ID Proof Reference</label>
            <input type="text" formControlName="idProof" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Aadhar / PAN / Passport Number">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Check-in Date</label>
            <input type="datetime-local" formControlName="checkInDate" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Account Status</label>
            <select formControlName="status" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <app-button variant="ghost" type="button" (click)="isEditModalOpen = false">Cancel</app-button>
          <app-button type="submit" [disabled]="isSubmitting">
            @if (isSubmitting) { <span>Saving...</span> } @else { <span>Save Changes</span> }
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Assign Room/Bed Modal -->
    <app-modal
      [isOpen]="isAssignModalOpen"
      [title]="'Assign Room & Bed - ' + selectedTenant?.name"
      size="md"
      (close)="isAssignModalOpen = false"
    >
      <div class="space-y-4 p-1">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Select Room</label>
          <select 
            [(ngModel)]="selectedRoomId" 
            (change)="onRoomSelect()"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">-- Choose a Room --</option>
            @for (room of availableRooms; track room.roomId) {
              <option [value]="room.roomId">Room {{ room.roomNumber }} ({{ room.roomType }}) - ₹{{ room.price }}</option>
            }
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Select Bed</label>
          <select 
            [(ngModel)]="selectedBedId" 
            [disabled]="!selectedRoomId"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
          >
            <option value="">-- Choose a Bed --</option>
            @for (bed of availableBeds; track bed.bedId) {
              <option [value]="bed.bedId">Bed B{{ bed.bedNumber }}</option>
            }
          </select>
          @if (selectedRoomId && availableBeds.length === 0 && !isBedsLoading) {
            <p class="text-xs text-destructive mt-1">No available beds in this room.</p>
          }
        </div>

        @if (isBedsLoading) {
          <div class="flex justify-center py-2">
            <app-loading-spinner size="sm"></app-loading-spinner>
          </div>
        }
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <app-button variant="ghost" type="button" (click)="isAssignModalOpen = false">Cancel</app-button>
        <app-button 
          (click)="onAssignSubmit()" 
          [disabled]="!selectedBedId || isSubmitting"
        >
          @if (isSubmitting) { <span>Assigning...</span> } @else { <span>Confirm Assignment</span> }
        </app-button>
      </div>
    </app-modal>

    <!-- Confirm Check-out Modal -->
    <app-confirm-modal
      [isOpen]="isConfirmModalOpen"
      title="Check Out Tenant"
      [message]="'Are you sure you want to check out ' + (selectedTenantForAction?.name || 'this tenant') + '? The assigned bed will be released.'"
      confirmText="Confirm Check Out"
      confirmVariant="destructive"
      (confirm)="onConfirmCheckOut()"
      (cancel)="closeConfirmModal()"
    ></app-confirm-modal>
  `,
  styles: []
})
export class AdminTenantsComponent implements OnInit {
  tenants: TenantResponse[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  filterStatus = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  // Edit Modal
  isEditModalOpen = false;
  selectedTenant: TenantResponse | null = null;
  editForm: FormGroup;

  // Assign Modal
  isAssignModalOpen = false;
  isConfirmModalOpen = false;
  selectedTenantForAction: TenantResponse | null = null;
  availableRooms: Room[] = [];
  availableBeds: Bed[] = [];
  selectedRoomId = '';
  selectedBedId = '';
  isBedsLoading = false;

  constructor(
    private adminTenantService: AdminTenantService,
    private adminRoomService: AdminRoomService,
    private adminBedService: AdminBedService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      idProof: [''],
      checkInDate: [''],
      status: ['ACTIVE']
    });
  }

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.isLoading = true;
    const filters = {
      search: this.searchQuery,
      status: this.filterStatus,
      sortBy: 'user.name',
      sortOrder: 'asc'
    };

    this.adminTenantService.getTenants(filters, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tenants = res.data.content;
          this.totalPages = res.data.totalPages;
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load tenants.');
        this.isLoading = false;
      }
    });
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.loadTenants();
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'T';
  }

  getStatusClass(status: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-bold ';
    switch (status) {
      case 'ACTIVE': return base + 'bg-success/10 text-success';
      case 'INACTIVE': return base + 'bg-destructive/10 text-destructive';
      case 'PENDING': return base + 'bg-yellow-500/10 text-yellow-600';
      default: return base + 'bg-muted text-muted-foreground';
    }
  }

  openEditModal(tenant: TenantResponse) {
    this.selectedTenant = tenant;
    this.editForm.patchValue({
      name: tenant.name,
      phone: tenant.phone,
      idProof: tenant.idProof,
      checkInDate: tenant.checkInDate ? new Date(tenant.checkInDate).toISOString().slice(0, 16) : '',
      status: tenant.status
    });
    this.isEditModalOpen = true;
  }

  onUpdate() {
    if (this.editForm.invalid || !this.selectedTenant) return;
    this.isSubmitting = true;
    this.adminTenantService.updateTenant(this.selectedTenant.tenantId, this.editForm.value).subscribe({
      next: () => {
        this.toastService.success('Tenant updated successfully.');
        this.isEditModalOpen = false;
        this.loadTenants();
        this.isSubmitting = false;
      },
      error: () => {
        this.toastService.error('Failed to update tenant.');
        this.isSubmitting = false;
      }
    });
  }

  onCheckOut(tenant: TenantResponse) {
    this.selectedTenantForAction = tenant;
    this.isConfirmModalOpen = true;
  }

  onConfirmCheckOut() {
    if (!this.selectedTenantForAction) return;

    this.adminTenantService.checkoutTenant(this.selectedTenantForAction.tenantId).subscribe({
      next: () => {
        this.toastService.success(`${this.selectedTenantForAction?.name} has been checked out.`);
        this.closeConfirmModal();
        this.loadTenants();
      },
      error: () => {
        this.toastService.error('Failed to process check out.');
        this.closeConfirmModal();
      }
    });
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.selectedTenantForAction = null;
  }

  openAssignModal(tenant: TenantResponse) {
    this.selectedTenant = tenant;
    this.selectedRoomId = '';
    this.selectedBedId = '';
    this.availableBeds = [];
    this.isAssignModalOpen = true;
    this.loadAvailableRooms();
  }

  loadAvailableRooms() {
    this.adminRoomService.getRooms({ availability: true }, 0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableRooms = res.data.content;
        }
      }
    });
  }

  onRoomSelect() {
    if (!this.selectedRoomId) {
      this.availableBeds = [];
      return;
    }
    this.isBedsLoading = true;
    this.availableBeds = [];
    this.selectedBedId = '';

    this.adminBedService.getBedsByRoom(this.selectedRoomId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableBeds = res.data.filter(b => b.status === 'AVAILABLE');
        }
        this.isBedsLoading = false;
      },
      error: () => {
        this.isBedsLoading = false;
      }
    });
  }

  onAssignSubmit() {
    if (!this.selectedTenant || !this.selectedBedId) return;
    this.isSubmitting = true;

    this.adminBedService.assignTenantToBed(this.selectedBedId, this.selectedTenant.tenantId).subscribe({
      next: () => {
        this.toastService.success('Bed assigned successfully.');
        this.isAssignModalOpen = false;
        this.loadTenants();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to assign bed.');
        this.isSubmitting = false;
      }
    });
  }
}
