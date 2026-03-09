import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-cancel-booking-modal',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
        <div class="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-6 animate-scale-in">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold">Cancel Booking</h2>
            <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          @if (isLoading) {
            <div class="flex flex-col items-center justify-center py-8">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
               <p class="text-sm text-muted-foreground">Checking cancellation policy...</p>
            </div>
          } @else if (error) {
             <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-6 whitespace-pre-line">
                 {{ error }}
             </div>
             <div class="flex justify-end space-x-3">
                <app-button variant="outline" (click)="closeModal()">Close</app-button>
             </div>
          } @else if (cancellationDetails) {
             <div class="space-y-4 mb-6">
                 
                 <div class="bg-muted/50 p-4 rounded-lg">
                    <p class="font-medium text-foreground mb-1">{{ cancellationDetails.message }}</p>
                    
                    @if (cancellationDetails.allowed) {
                        <div class="mt-4 space-y-2 text-sm">
                            <div class="flex justify-between items-center pb-2 border-b border-border/50">
                                <span class="text-muted-foreground">Total Booking Amount</span>
                                <span>₹{{ cancellationDetails.totalAmount }}</span>
                            </div>
                            <div class="flex justify-between items-center font-bold text-lg pt-2" [class.text-green-600]="cancellationDetails.refundAmount > 0">
                                <span>Refund Amount</span>
                                <span>₹{{ cancellationDetails.refundAmount }}</span>
                            </div>
                        </div>
                    }
                 </div>
                 
                 @if (!cancellationDetails.allowed) {
                    <div class="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                        <div class="flex items-center gap-2 font-medium mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            Cancellation Not Allowed
                        </div>
                        You can only cancel bookings up to 24 hours before check-in.
                    </div>
                 }
             </div>

             <div class="flex justify-end space-x-3">
                <app-button variant="outline" (click)="closeModal()" [disabled]="isCancelling">Keep Booking</app-button>
                @if (cancellationDetails.allowed) {
                    <app-button variant="destructive" (click)="confirmCancellation()" [disabled]="isCancelling">
                        {{ isCancelling ? 'Processing...' : 'Yes, Cancel Booking' }}
                    </app-button>
                }
             </div>
          }
        </div>
      </div>
    }
  `
})
export class CancelBookingModalComponent implements OnInit {
    @Input() isOpen = false;
    @Input() booking!: Booking;
    @Output() modalClosed = new EventEmitter<boolean>();

    isLoading = false;
    isCancelling = false;
    error = '';
    cancellationDetails: any = null;

    constructor(private bookingService: BookingService, private toastService: ToastService) { }

    ngOnInit(): void {
        if (this.isOpen && this.booking) {
            this.checkCancellationPolicy();
        }
    }

    // Handle when modal is opened via changing @Input
    ngOnChanges(changes: any) {
        if (changes.isOpen && changes.isOpen.currentValue === true && this.booking) {
            this.checkCancellationPolicy();
        }
    }

    checkCancellationPolicy() {
        this.isLoading = true;
        this.error = '';
        this.cancellationDetails = null;

        this.bookingService.checkCancellation(this.booking.bookingId!).subscribe({
            next: (res) => {
                this.cancellationDetails = res.data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to fetch cancellation details.';
                this.isLoading = false;
            }
        });
    }

    confirmCancellation() {
        this.isCancelling = true;
        this.error = '';

        this.bookingService.cancelBooking(this.booking.bookingId!).subscribe({
            next: () => {
                this.isCancelling = false;
                let successMsg = 'Your booking has been canceled.';
                if (this.cancellationDetails?.refundAmount > 0) {
                    successMsg += ` A refund of ₹${this.cancellationDetails.refundAmount} will be processed within 3-5 business days.`;
                }
                this.toastService.success(successMsg);
                this.modalClosed.emit(true); // emit true on success
            },
            error: (err) => {
                this.error = err.error?.message || 'Cancellation failed. Please try again.';
                this.isCancelling = false;
            }
        });
    }

    closeModal() {
        if (!this.isCancelling) {
            this.modalClosed.emit(false); // emit false
            this.isOpen = false;
            this.cancellationDetails = null; // reset
        }
    }
}
