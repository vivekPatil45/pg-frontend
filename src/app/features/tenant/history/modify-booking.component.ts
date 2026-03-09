import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-modify-booking',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, LoadingSpinnerComponent],
    providers: [DatePipe],
    template: `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in relative">
      <div class="flex items-center space-x-4">
        <button [routerLink]="['/tenant/history']" class="text-muted-foreground hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Modify Booking</h1>
          <p class="text-muted-foreground mt-1">Update dates and guests for your booking</p>
        </div>
      </div>

      @if (isLoading) {
         <div class="flex justify-center py-12">
            <app-loading-spinner size="lg"></app-loading-spinner>
         </div>
      } @else if (booking) {
        <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
           <form [formGroup]="modifyForm" (ngSubmit)="checkAvailability()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Move-in Date</label>
                        <input type="date" formControlName="moveInDate" [min]="minDate" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    </div>
                </div>

                @if (error) {
                    <div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {{ error }}
                    </div>
                }

                <div class="flex justify-end pt-4">
                    <app-button type="submit" [disabled]="modifyForm.invalid || isChecking" class="w-full md:w-auto">
                        {{ isChecking ? 'Checking...' : 'Check Availability & Price' }}
                    </app-button>
                </div>
           </form>
        </div>

        @if (modificationCheckResult) {
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm mt-6 animate-fade-in">
                <h3 class="text-lg font-bold mb-4">Modification Summary</h3>
                <div class="space-y-3 mb-6">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-muted-foreground">Original Total:</span>
                        <span>₹{{ booking.totalAmount }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm font-medium">
                        <span class="text-muted-foreground">New Total Amount:</span>
                        <span>₹{{ modificationCheckResult.newTotalAmount }}</span>
                    </div>
                    
                    <div class="h-px bg-border my-2"></div>
                    
                    <div class="flex justify-between items-center font-bold" [class.text-destructive]="modificationCheckResult.isPriceIncreased" [class.text-green-600]="modificationCheckResult.isPriceDecreased">
                        <span>Difference:</span>
                        <span>
                            {{ modificationCheckResult.isPriceIncreased ? '+' : '' }}
                            ₹{{ modificationCheckResult.priceDifference }}
                        </span>
                    </div>

                    @if (modificationCheckResult.isPriceDecreased) {
                        <p class="text-sm text-green-600 bg-green-50 p-2 rounded mt-2">
                            Your updated booking costs less. Refund (if applicable) will be processed as per the cancellation policy.
                        </p>
                    }
                </div>

                <div class="flex justify-end space-x-3">
                    <app-button variant="outline" (click)="modificationCheckResult = null">Cancel</app-button>
                    <app-button (click)="confirmModification()" [disabled]="isSubmitting">
                        {{ isSubmitting ? 'Processing...' : (modificationCheckResult.isPriceIncreased ? 'Proceed to Pay Difference' : 'Confirm Changes') }}
                    </app-button>
                </div>
            </div>
        }
      } @else {
          <div class="flex justify-center p-12 text-destructive">
             Error: Booking not found.
          </div>
      }
    </div>
  `
})
export class ModifyBookingComponent implements OnInit {
    bookingId = '';
    booking: Booking | null = null;
    isLoading = true;
    isChecking = false;
    isSubmitting = false;
    error = '';

    modifyForm: FormGroup;
    minDate: string;

    modificationCheckResult: any = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private toastService: ToastService
    ) {
        const today = new Date();
        this.minDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';

        this.modifyForm = this.fb.group({
            moveInDate: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
        if (this.bookingId) {
            this.fetchBooking();
        } else {
            this.error = 'Invalid booking ID';
            this.isLoading = false;
        }

        this.modifyForm.valueChanges.subscribe(() => {
            this.modificationCheckResult = null;
            this.error = '';
        });
    }


    fetchBooking() {
        this.isLoading = true;
        this.bookingService.getBookingById(this.bookingId).subscribe({
            next: (res) => {
                this.booking = res.data;
                if (this.booking) {
                    this.modifyForm.patchValue({
                        moveInDate: this.booking.moveInDate,
                    });
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load booking.';
                this.isLoading = false;
            }
        });
    }

    checkAvailability() {
        if (this.modifyForm.invalid || !this.booking) return;

        this.isChecking = true;
        this.error = '';

        const request = {
            roomId: this.booking.room?.roomId || this.booking.roomId,
            moveInDate: this.modifyForm.value.moveInDate,
        };

        this.bookingService.checkModification(this.bookingId, request).subscribe({
            next: (res) => {
                this.modificationCheckResult = res.data;
                this.isChecking = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to check availability.';
                this.isChecking = false;
            }
        });
    }

    confirmModification() {
        if (!this.booking || !this.modificationCheckResult || this.modifyForm.invalid) return;

        this.isSubmitting = true;
        this.error = '';

        const request = {
            roomId: this.booking.room?.roomId || this.booking.roomId,
            moveInDate: this.modifyForm.value.moveInDate,
        };

        this.bookingService.modifyBooking(this.bookingId, request).subscribe({
            next: () => {
                if (this.modificationCheckResult.isPriceIncreased) {
                    this.router.navigate(['/tenant/payment', this.bookingId], { queryParams: { isModification: true } });
                } else {
                    this.toastService.success('Your booking has been successfully modified.');
                    this.router.navigate(['/tenant/history']);
                }
                this.isSubmitting = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Modification failed. Please try again.';
                this.isSubmitting = false;
            }
        });
    }
}
