import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TenantService, ComplaintRequest } from '../../../core/services/tenant.service';
import { Complaint } from '../../../models/complaint.model';
import { COMPLAINT_CATEGORIES, CONTACT_PREFERENCES } from '../../../shared/utils/constants';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tenant-complaints',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    ModalComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Complaints</h1>
          <p class="text-muted-foreground mt-1">
            Report issues or provide feedback
          </p>
        </div>
        <app-button (click)="openNewComplaintModal()">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </app-button>
      </div>

      <!-- Loading State -->
      @if (isLoading && !complaints.length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-card h-48 rounded-xl border border-border p-6 animate-pulse"></div>
            <div class="bg-card h-48 rounded-xl border border-border p-6 animate-pulse"></div>
            <div class="bg-card h-48 rounded-xl border border-border p-6 animate-pulse"></div>
        </div>
      }

      <!-- Complaints List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (complaint of complaints; track complaint.id) {
          <div class="bg-card rounded-xl border border-border p-6 card-hover">
            <div class="flex justify-between items-start mb-4">
              <!-- Use $any() to cast the string status to BadgeStatus type expected by the component -->
              <app-status-badge [status]="$any(complaint.status)"></app-status-badge>
              <span class="text-xs text-muted-foreground">
                {{ complaint.createdAt | date:'shortDate' }}
              </span>
            </div>
            
            <h3 class="font-semibold text-lg text-foreground mb-2">{{ complaint.title }}</h3>
            <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
              {{ complaint.description }}
            </p>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">ID: {{ complaint.complaintId }}</span>
                @if (complaint.expectedResolutionDate) {
                  <span class="text-muted-foreground">Due: {{ complaint.expectedResolutionDate | date:'shortDate' }}</span>
                }
              </div>
              
              <div class="flex items-center justify-between pt-3 border-t border-border">
                <span class="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                  {{ complaint.category }}
                </span>
                <span [class]="getPriorityClass(complaint.priority)">
                  {{ complaint.priority }}
                </span>
              </div>
              
              <div class="flex gap-2 pt-3 border-t border-border">
                <app-button variant="outline" size="sm" class="flex-1" (click)="viewComplaint(complaint)">
                  View Details
                </app-button>
                @if (complaint.status === 'OPEN') {
                  <app-button variant="ghost" size="sm" class="flex-1" (click)="openEditModal(complaint)">
                    <svg class="h-4 w-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </app-button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Empty State -->
      @if (!isLoading && complaints.length === 0 && !errorMessage) {
        <div class="p-12 text-center border border-dashed border-border rounded-xl">
          <svg class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-foreground">No complaints found</h3>
          <p class="text-muted-foreground mt-1">
            You have not registered any complaints.
          </p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage) {
        <div class="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <div class="flex items-start gap-3">
            <svg class="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-semibold mb-1">Error Loading Complaints</h3>
              <p class="text-sm">{{ errorMessage }}</p>
              <app-button variant="outline" size="sm" class="mt-3" (click)="loadComplaints()">
                Try Again
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Complaint Modal (New/Edit) -->
    <app-modal
      [isOpen]="isModalOpen"
      [title]="isEditing ? 'Edit Complaint' : 'File a Complaint'"
      (close)="closeModal()"
    >
      <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <!-- Category -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Complaint Category <span class="text-destructive">*</span></label>
            <select
              formControlName="category"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled selected>Select a category</option>
              @for (category of categories; track category) {
                <option [value]="category">{{ category.replace('_', ' ') }}</option>
              }
            </select>
            @if (complaintForm.get('category')?.touched && complaintForm.get('category')?.invalid) {
                <p class="text-xs text-destructive">Please select a category.</p>
            }
          </div>

           <!-- Booking ID -->
           <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Booking ID</label>
            <input
              type="text"
              formControlName="bookingId"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter Booking ID (Optional)"
            />
          </div>

          <!-- Title -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Complaint Title <span class="text-destructive">*</span></label>
            <input
              type="text"
              formControlName="title"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Brief summary of the issue (10-100 chars)"
            />
             @if (complaintForm.get('title')?.touched && complaintForm.get('title')?.invalid) {
                @if (complaintForm.get('title')?.errors?.['required']) {
                    <p class="text-xs text-destructive">Title is required.</p>
                }
                @if (complaintForm.get('title')?.errors?.['minlength']) {
                    <p class="text-xs text-destructive">Title must be at least 10 characters.</p>
                }
                @if (complaintForm.get('title')?.errors?.['maxlength']) {
                    <p class="text-xs text-destructive">Title must not exceed 100 characters.</p>
                }
            }
          </div>

          <!-- Description -->
          <div class="space-y-2">
             <label class="text-sm font-medium text-foreground">Complaint Description <span class="text-destructive">*</span></label>
            <textarea
              formControlName="description"
              rows="4"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Please provide details about the issue (20-500 chars)..."
            ></textarea>
            @if (complaintForm.get('description')?.touched && complaintForm.get('description')?.invalid) {
                @if (complaintForm.get('description')?.errors?.['required']) {
                    <p class="text-xs text-destructive">Description is required.</p>
                }
                @if (complaintForm.get('description')?.errors?.['minlength']) {
                    <p class="text-xs text-destructive">Please provide more details to help us resolve your issue (min 20 chars).</p>
                }
                @if (complaintForm.get('description')?.errors?.['maxlength']) {
                    <p class="text-xs text-destructive">Description must not exceed 500 characters.</p>
                }
            }
          </div>

          <!-- Contact Preference -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground block">Contact Preference <span class="text-destructive">*</span></label>
            <div class="flex gap-4">
                @for (pref of contactPreferences; track pref) {
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" formControlName="contactPreference" [value]="pref" class="accent-primary h-4 w-4">
                        <span class="text-sm">{{ pref }}</span>
                    </label>
                }
            </div>
             @if (complaintForm.get('contactPreference')?.touched && complaintForm.get('contactPreference')?.invalid) {
                <p class="text-xs text-destructive">Please select a contact preference.</p>
            }
          </div>

          @if (error) {
            <div class="p-3 rounded bg-destructive/10 text-destructive text-sm">
                {{ error }}
            </div>
          }
        </div>

        <div class="mt-6 flex justify-end gap-3" footer>
           <app-button variant="ghost" (click)="closeModal()" type="button">
            Cancel
          </app-button>
          
           <app-button variant="outline" (click)="resetForm()" type="button">
            Reset
          </app-button>

          <app-button type="submit" [disabled]="complaintForm.invalid || isSubmitting">
            @if (isSubmitting) {
                {{ isEditing ? 'Updating...' : 'Sending...' }}
            } @else {
                {{ isEditing ? 'Update Complaint' : 'Submit Complaint' }}
            }
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Success Modal -->
    <app-modal [isOpen]="showSuccessModal" title="Success" (close)="closeSuccessModal()">
      <div class="space-y-4">
        <div class="flex items-center justify-center text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-center text-foreground">{{ successMessage }}</p>
        <div class="flex justify-center pt-4">
          <app-button (click)="closeSuccessModal()">Close</app-button>
        </div>
      </div>
    </app-modal>

    <!-- Complaint Detail Modal -->
    <app-modal [isOpen]="isDetailModalOpen" [title]="'Complaint Details - ' + (selectedComplaint?.complaintId || '')" (close)="closeDetailModal()">
      @if (selectedComplaint) {
        <div class="space-y-6">
          <!-- Status and Priority -->
          <div class="flex items-center justify-between">
            <app-status-badge [status]="$any(selectedComplaint.status)"></app-status-badge>
            <span [class]="getPriorityClass(selectedComplaint.priority)">{{ selectedComplaint.priority }}</span>
          </div>

          <!-- Basic Info -->
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Category</label>
              <p class="text-foreground">{{ selectedComplaint.category }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Title</label>
              <p class="text-foreground">{{ selectedComplaint.title }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Description</label>
              <p class="text-foreground whitespace-pre-wrap">{{ selectedComplaint.description }}</p>
            </div>
            @if (selectedComplaint.bookingId) {
              <div>
                <label class="text-sm font-medium text-muted-foreground">Booking ID</label>
                <p class="text-foreground">{{ selectedComplaint.bookingId }}</p>
              </div>
            }
            @if (selectedComplaint.expectedResolutionDate) {
              <div>
                <label class="text-sm font-medium text-muted-foreground">Expected Resolution Date</label>
                <p class="text-foreground">{{ selectedComplaint.expectedResolutionDate | date:'medium' }}</p>
              </div>
            }
          </div>

          <!-- Resolution Notes -->
          @if (selectedComplaint.resolutionNotes) {
            <div class="p-4 bg-muted rounded-lg">
              <label class="text-sm font-medium text-foreground block mb-2">Resolution Notes</label>
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ selectedComplaint.resolutionNotes }}</p>
            </div>
          }

          <!-- Action Log -->
          @if (selectedComplaint.actionLog && selectedComplaint.actionLog.length > 0) {
            <div>
              <label class="text-sm font-medium text-foreground block mb-3">Activity Log</label>
              <div class="space-y-2">
                @for (log of selectedComplaint.actionLog; track log.timestamp) {
                  <div class="p-3 bg-muted rounded-lg text-sm">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-foreground">{{ log.action }}</span>
                      <span class="text-xs text-muted-foreground">{{ log.timestamp | date:'short' }}</span>
                    </div>
                    <p class="text-muted-foreground">By: {{ log.performedBy }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Status Update Actions -->
          @if (selectedComplaint.status === 'RESOLVED') {
            <div class="flex gap-3 pt-4 border-t border-border">
              <app-button variant="default" class="flex-1" (click)="confirmResolution()" [disabled]="isUpdatingStatus">
                @if (isUpdatingStatus) { Updating... } @else { Confirm Resolution }
              </app-button>
              <app-button variant="outline" class="flex-1" (click)="reopenComplaint()" [disabled]="isUpdatingStatus">
                @if (isUpdatingStatus) { Updating... } @else { Reopen }
              </app-button>
            </div>
          }
          @if (selectedComplaint.status === 'CLOSED') {
            <div class="p-3 bg-green-500/10 text-green-600 rounded-lg text-sm text-center">
              This complaint has been closed. You can reopen it if the issue persists.
            </div>
            <app-button variant="outline" class="w-full" (click)="reopenComplaint()" [disabled]="isUpdatingStatus">
              @if (isUpdatingStatus) { Updating... } @else { Reopen Complaint }
            </app-button>
          }

          @if (detailError) {
            <div class="p-3 rounded bg-destructive/10 text-destructive text-sm">
              {{ detailError }}
            </div>
          }
        </div>
      }
    </app-modal>
  `,
  styles: []
})
export class TenantComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  isLoading = false;
  isSubmitting = false;
  error = '';

  categories = COMPLAINT_CATEGORIES;
  contactPreferences = CONTACT_PREFERENCES;
  isModalOpen = false;
  showSuccessModal = false;
  successMessage = '';
  errorMessage = '';
  isDetailModalOpen = false;
  selectedComplaint: Complaint | null = null;
  isUpdatingStatus = false;
  detailError = '';
  complaintForm: FormGroup;
  isEditing = false;
  editingComplaintId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private authService: AuthService
  ) {
    this.complaintForm = this.fb.group({
      category: ['', Validators.required],
      bookingId: [''], // Optional
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      contactPreference: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = ''; // Clear previous errors

    this.tenantService.getMyComplaints().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.complaints = response.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading complaints', err);

        // Show user-friendly error message
        if (err.status === 404 && err.error?.message?.includes('Tenant profile not found')) {
          this.errorMessage = 'Your tenant profile is not set up yet. Please contact support or try logging out and back in.';
        } else if (err.status === 404) {
          this.errorMessage = 'The complaint you are looking for does not exist or has been deleted.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'You are not authorized to view complaints. Please log in again.';
        } else {
          this.errorMessage = 'Unable to fetch complaint status. Please try again later.';
        }
      }
    });
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'LOW': 'text-info',
      'MEDIUM': 'text-warning',
      'HIGH': 'text-destructive',
      'URGENT': 'text-destructive font-bold'
    };
    return `text-xs font-bold ${classes[priority as keyof typeof classes] || 'text-muted-foreground'}`;
  }

  openNewComplaintModal() {
    this.isEditing = false;
    this.editingComplaintId = null;
    this.isModalOpen = true;
    this.error = '';
    this.complaintForm.reset();
  }

  openEditModal(complaint: Complaint) {
    this.isEditing = true;
    this.editingComplaintId = complaint.complaintId;
    this.isModalOpen = true;
    this.error = '';

    this.complaintForm.patchValue({
      category: complaint.category,
      bookingId: complaint.bookingId || '',
      title: complaint.title,
      description: complaint.description,
      contactPreference: complaint.contactPreference
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editingComplaintId = null;
    this.complaintForm.reset();
    this.error = '';
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  viewComplaint(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.isDetailModalOpen = true;
    this.detailError = '';
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedComplaint = null;
    this.detailError = '';
  }

  confirmResolution() {
    if (!this.selectedComplaint) return;

    this.isUpdatingStatus = true;
    this.detailError = '';

    this.tenantService.updateComplaintStatus(this.selectedComplaint.complaintId, 'CLOSED').subscribe({
      next: (response) => {
        this.isUpdatingStatus = false;
        if (response.success && response.data) {
          // Update the complaint in the list
          const index = this.complaints.findIndex(c => c.complaintId === this.selectedComplaint?.complaintId);
          if (index !== -1) {
            this.complaints[index] = response.data;
          }
          this.selectedComplaint = response.data;
          this.successMessage = 'Complaint has been marked as closed. Thank you for your feedback!';
          this.showSuccessModal = true;
          this.closeDetailModal();
        }
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.detailError = err.error?.message || 'Failed to update complaint status. Please try again.';
      }
    });
  }

  reopenComplaint() {
    if (!this.selectedComplaint) return;

    this.isUpdatingStatus = true;
    this.detailError = '';

    this.tenantService.updateComplaintStatus(this.selectedComplaint.complaintId, 'OPEN').subscribe({
      next: (response) => {
        this.isUpdatingStatus = false;
        if (response.success && response.data) {
          // Update the complaint in the list
          const index = this.complaints.findIndex(c => c.complaintId === this.selectedComplaint?.complaintId);
          if (index !== -1) {
            this.complaints[index] = response.data;
          }
          this.selectedComplaint = response.data;
          this.successMessage = 'Complaint has been reopened. Our support team will review it again.';
          this.showSuccessModal = true;
          this.closeDetailModal();
        }
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.detailError = err.error?.message || 'Failed to reopen complaint. Please try again.';
      }
    });
  }

  resetForm() {
    this.complaintForm.reset();
  }

  onSubmit() {
    if (this.complaintForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      const formValue = this.complaintForm.value;

      const newComplaint: ComplaintRequest = {
        category: formValue.category,
        title: formValue.title,
        description: formValue.description,
        contactPreference: formValue.contactPreference,
        bookingId: formValue.bookingId || null // Send null instead of undefined
      };

      if (this.isEditing && this.editingComplaintId) {
        this.tenantService.updateComplaint(this.editingComplaintId, newComplaint).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.success) {
              this.successMessage = `Your complaint #${response.data.complaintId} has been successfully updated.`;
              this.showSuccessModal = true;
              this.closeModal();
              this.loadComplaints();
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Error updating complaint', err);
            this.error = err.error?.message || 'Failed to update complaint. Please try again.';
          }
        });
      } else {
        this.tenantService.createComplaint(newComplaint).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.success) {
              this.successMessage = `Your complaint has been successfully submitted. Complaint ID: #${response.data.complaintId}. Our support team will get back to you soon.`;
              this.showSuccessModal = true;
              this.closeModal(); // Close form modal
              this.loadComplaints(); // Reload list
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Error creating complaint', err);
            this.error = 'Failed to submit complaint. Please try again.';
            if (err.error && err.error.message) {
              this.error = err.error.message;
            }
          }
        });
      }
    } else {
      this.complaintForm.markAllAsTouched();
    }
  }
}
