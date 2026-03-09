import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminBedService, Bed } from '../../../core/services/admin-bed.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../models/room.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-beds',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ConfirmModalComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-border">
        <div>
          <h3 class="text-lg font-semibold text-foreground">Room {{ room?.roomNumber }} Beds</h3>
          <p class="text-sm text-muted-foreground">{{ room?.roomType }} - {{ room?.floor }}th Floor</p>
        </div>
        <div class="text-right text-sm">
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-success"></span>
            <span>Available: {{ availableCount }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-destructive"></span>
            <span>Occupied: {{ occupiedCount }}</span>
          </div>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-8">
          <app-loading-spinner></app-loading-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (bed of beds; track bed.bedId) {
            <div class="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                  <div class="bg-primary/10 text-primary h-8 w-8 rounded-lg flex items-center justify-center font-bold">
                    B{{ bed.bedNumber }}
                  </div>
                  <app-status-badge [status]="bed.status"></app-status-badge>
                </div>
                
                <div class="flex gap-1">
                    @if (bed.status === 'OCCUPIED') {
                        <app-button variant="outline" size="sm" (click)="onMarkAvailable(bed)" [disabled]="isUpdating">
                            Release
                        </app-button>
                    }
                    <select 
                      [ngModel]="bed.status" 
                      (ngModelChange)="onStatusChange(bed, $event)"
                      class="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                </div>
              </div>

              @if (bed.tenant) {
                <div class="mt-2 text-sm">
                  <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-wider mb-1">Current Tenant</p>
                  <p class="text-foreground font-semibold">{{ bed.tenant.user?.firstName }} {{ bed.tenant.user?.lastName }}</p>
                  <p class="text-muted-foreground text-xs">{{ bed.tenant.user?.email }}</p>
                </div>
              } @else if (bed.status === 'AVAILABLE') {
                 <div class="mt-2 p-2 bg-muted/20 rounded border border-dashed border-border text-center">
                    <p class="text-xs text-muted-foreground italic">No tenant assigned</p>
                 </div>
              } @else {
                 <div class="mt-2 p-2 bg-yellow-500/5 rounded border border-dashed border-yellow-500/20 text-center">
                    <p class="text-xs text-yellow-600 italic">{{ bed.status }}</p>
                 </div>
              }
            </div>
          } @empty {
            <div class="col-span-full py-12 text-center text-muted-foreground">
              No beds defined for this room.
            </div>
          }
        </div>
      }
    </div>

    <!-- Confirm Mark Available Modal -->
    <app-confirm-modal
      [isOpen]="isConfirmModalOpen"
      title="Mark Bed Available"
      [message]="'Are you sure you want to mark bed B' + (selectedBedForAction?.bedNumber || '') + ' as available? This will remove the tenant assignment.'"
      confirmText="Mark Available"
      (confirm)="onConfirmMarkAvailable()"
      (cancel)="closeConfirmModal()"
    ></app-confirm-modal>
  `,
})
export class AdminBedsComponent implements OnInit {
  @Input() room: Room | null = null;

  beds: Bed[] = [];
  isLoading = false;
  isUpdating = false;
  isConfirmModalOpen = false;
  selectedBedForAction: Bed | null = null;
  errorMessage = '';

  constructor(
    private bedService: AdminBedService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (this.room?.roomId) {
      this.loadBeds();
    }
  }

  loadBeds() {
    if (!this.room?.roomId) return;
    this.isLoading = true;
    this.bedService.getBedsByRoom(this.room.roomId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.beds = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load beds.');
        this.isLoading = false;
      }
    });
  }

  get availableCount() {
    return this.beds.filter(b => b.status === 'AVAILABLE').length;
  }

  get occupiedCount() {
    return this.beds.filter(b => b.status === 'OCCUPIED').length;
  }

  onMarkAvailable(bed: Bed) {
    this.selectedBedForAction = bed;
    this.isConfirmModalOpen = true;
  }

  onConfirmMarkAvailable() {
    if (!this.selectedBedForAction?.bedId) return;

    this.isUpdating = true;
    this.bedService.markBedAvailable(this.selectedBedForAction.bedId).subscribe({
      next: () => {
        this.toastService.success(`Bed B${this.selectedBedForAction?.bedNumber} is now available.`);
        this.closeConfirmModal();
        this.loadBeds();
        this.isUpdating = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update bed status.');
        this.closeConfirmModal();
        this.isUpdating = false;
      }
    });
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.selectedBedForAction = null;
  }

  onStatusChange(bed: Bed, newStatus: string) {
    if (newStatus === bed.status) return;

    this.isUpdating = true;
    this.bedService.updateBedStatus(bed.bedId, newStatus).subscribe({
      next: () => {
        this.toastService.success(`Bed B${bed.bedNumber} status updated to ${newStatus}.`);
        this.loadBeds();
        this.isUpdating = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update bed status.');
        this.loadBeds(); // Reset to current status
        this.isUpdating = false;
      }
    });
  }
}
