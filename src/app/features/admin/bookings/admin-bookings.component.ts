import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AdminBookingService, AdminBookingResponse } from '../../../core/services/admin-booking.service';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { AdminBedService, Bed } from '../../../core/services/admin-bed.service';
import { ToastService } from '../../../core/services/toast.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Booking Management</h1>
          <p class="text-muted-foreground mt-1">Approve, reject, and track all booking requests</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-64">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadBookings()"
              placeholder="Search by tenant name..."
              class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <select [(ngModel)]="filterStatus" (change)="loadBookings()" class="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CONFIRMED">Confirmed</option>
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
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Booking ID</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Tenant</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Move-in Date</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Payment</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (booking of bookings; track booking.bookingId) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="py-3 px-4 text-sm text-foreground">
                      <span class="text-muted-foreground">#{{ booking.bookingId | slice:0:8 }}</span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-medium text-foreground">{{ booking.tenantName }}</div>
                      <div class="text-xs text-muted-foreground">{{ booking.tenantEmail || booking.tenantPhone }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground font-medium">
                      @if (booking.roomNumber) {
                        Room {{ booking.roomNumber }}
                        @if (booking.bedNumber) { <span class="text-xs text-muted-foreground font-normal block">Bed {{ booking.bedNumber }}</span> }
                      } @else {
                        <span class="text-muted-foreground italic font-normal">Not Assigned</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                      {{ booking.moveInDate | date:'mediumDate' }}
                    </td>
                    <td class="py-3 px-4">
                      <span [class]="getStatusClass(booking.status)">{{ booking.status.replace('_', ' ') }}</span>
                    </td>
                    <td class="py-3 px-4">
                      <span [class]="getPaymentStatusClass(booking.paymentStatus)">{{ booking.paymentStatus }}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex justify-end gap-1">
                        @if (booking.status === 'PENDING') {
                          <app-button variant="ghost" size="sm" class="text-primary" (click)="openApproveModal(booking)">Approve</app-button>
                          <app-button variant="ghost" size="sm" class="text-destructive" (click)="openRejectModal(booking)">Reject</app-button>
                        } @else if (booking.status !== 'CANCELLED' && booking.status !== 'REJECTED') {
                          <app-button variant="ghost" size="sm" class="text-muted-foreground" (click)="openCancelModal(booking)">Cancel</app-button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-muted-foreground">No bookings found.</td>
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

    <!-- Approve Modal -->
    <app-modal
      [isOpen]="isApproveModalOpen"
      [title]="'Approve Booking - ' + selectedBooking?.tenantName"
      size="md"
      (close)="isApproveModalOpen = false"
    >
      <div class="space-y-4 p-1">
        <p class="text-sm text-muted-foreground">Please select a room and bed to assign to this tenant.</p>
        
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
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Admin Notes (Optional)</label>
          <textarea 
            [(ngModel)]="adminNotes" 
            rows="3"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Any specific instructions..."
          ></textarea>
        </div>

        @if (isBedsLoading) {
          <div class="flex justify-center py-2">
            <app-loading-spinner size="sm"></app-loading-spinner>
          </div>
        }
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <app-button variant="ghost" type="button" (click)="isApproveModalOpen = false">Cancel</app-button>
        <app-button 
          (click)="onApproveSubmit()" 
          [disabled]="!selectedBedId || isSubmitting"
        >
          @if (isSubmitting) { <span>Approving...</span> } @else { <span>Approve & Assign</span> }
        </app-button>
      </div>
    </app-modal>

    <!-- Reject/Cancel Modal -->
    <app-modal
      [isOpen]="isRejectModalOpen"
      [title]="(modalAction === 'REJECT' ? 'Reject' : 'Cancel') + ' Booking - ' + selectedBooking?.tenantName"
      size="md"
      (close)="isRejectModalOpen = false"
    >
      <div class="space-y-4 p-1">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Reason for {{ modalAction === 'REJECT' ? 'rejection' : 'cancellation' }}</label>
          <textarea 
            [(ngModel)]="rejectionReason" 
            rows="4"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Please provide a reason..."
          ></textarea>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <app-button variant="ghost" type="button" (click)="isRejectModalOpen = false">Close</app-button>
        <app-button 
          variant="destructive"
          (click)="onRejectSubmit()" 
          [disabled]="!rejectionReason || isSubmitting"
        >
          @if (isSubmitting) { <span>Processing...</span> } @else { <span>Confirm {{ modalAction === 'REJECT' ? 'Rejection' : 'Cancellation' }}</span> }
        </app-button>
      </div>
    </app-modal>
  `,
  styles: []
})
export class AdminBookingsComponent implements OnInit {
  bookings: AdminBookingResponse[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  filterStatus = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  // Modals
  isApproveModalOpen = false;
  isRejectModalOpen = false;
  selectedBooking: AdminBookingResponse | null = null;
  modalAction: 'REJECT' | 'CANCEL' = 'REJECT';

  // Approval Data
  availableRooms: Room[] = [];
  availableBeds: Bed[] = [];
  selectedRoomId = '';
  selectedBedId = '';
  adminNotes = '';
  isBedsLoading = false;

  // Rejection/Cancellation Data
  rejectionReason = '';

  constructor(
    private adminBookingService: AdminBookingService,
    private adminRoomService: AdminRoomService,
    private adminBedService: AdminBedService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.adminBookingService.getBookings(this.filterStatus, this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.bookings = res.data.content;
          this.totalPages = res.data.totalPages;
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load bookings.');
        this.isLoading = false;
      }
    });
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.loadBookings();
  }

  getStatusClass(status: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-bold ';
    switch (status) {
      case 'PENDING': return base + 'bg-yellow-500/10 text-yellow-600';
      case 'APPROVED': return base + 'bg-green-500/10 text-green-600';
      case 'REJECTED': return base + 'bg-red-500/10 text-red-600';
      case 'CONFIRMED': return base + 'bg-primary/10 text-primary';
      case 'CANCELLED': return base + 'bg-muted text-muted-foreground';
      case 'PENDING_PAYMENT': return base + 'bg-orange-500/10 text-orange-600';
      default: return base + 'bg-muted text-muted-foreground';
    }
  }

  getPaymentStatusClass(status: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ';
    switch (status) {
      case 'PAID': return base + 'bg-green-500/10 text-green-600';
      case 'PENDING': return base + 'text-amber-500';
      case 'PARTIAL': return base + 'text-primary';
      default: return base + 'text-muted-foreground';
    }
  }

  openApproveModal(booking: AdminBookingResponse) {
    this.selectedBooking = booking;
    this.selectedRoomId = '';
    this.selectedBedId = '';
    this.adminNotes = '';
    this.availableBeds = [];
    this.isApproveModalOpen = true;
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

  onApproveSubmit() {
    if (!this.selectedBooking || !this.selectedBedId) return;
    this.isSubmitting = true;
    this.adminBookingService.approveBooking(
      this.selectedBooking.bookingId,
      this.selectedRoomId,
      this.selectedBedId,
      this.adminNotes
    ).subscribe({
      next: () => {
        this.toastService.success('Booking approved and bed assigned.');
        this.isApproveModalOpen = false;
        this.loadBookings();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to approve booking.');
        this.isSubmitting = false;
      }
    });
  }

  openRejectModal(booking: AdminBookingResponse) {
    this.selectedBooking = booking;
    this.rejectionReason = '';
    this.modalAction = 'REJECT';
    this.isRejectModalOpen = true;
  }

  openCancelModal(booking: AdminBookingResponse) {
    this.selectedBooking = booking;
    this.rejectionReason = '';
    this.modalAction = 'CANCEL';
    this.isRejectModalOpen = true;
  }

  onRejectSubmit() {
    if (!this.selectedBooking || !this.rejectionReason) return;
    this.isSubmitting = true;

    const request = this.modalAction === 'REJECT'
      ? this.adminBookingService.rejectBooking(this.selectedBooking.bookingId, this.rejectionReason)
      : this.adminBookingService.cancelBooking(this.selectedBooking.bookingId, this.rejectionReason);

    request.subscribe({
      next: () => {
        this.toastService.success(`Booking ${this.modalAction.toLowerCase()}ed successfully.`);
        this.isRejectModalOpen = false;
        this.loadBookings();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || `Failed to ${this.modalAction.toLowerCase()} booking.`);
        this.isSubmitting = false;
      }
    });
  }
}
