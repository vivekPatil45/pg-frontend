import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Booking } from '../../../models/booking.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
    selector: 'app-booking-success',
    standalone: true,
    imports: [CommonModule, ButtonComponent, LoadingSpinnerComponent, StatusBadgeComponent],
    template: `
    <div class="max-w-2xl mx-auto p-6 animate-fade-in text-center">
      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (booking) {
        <div class="bg-card rounded-xl border border-border p-8 shadow-md">
            <!-- Success Icon -->
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 class="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p class="text-muted-foreground mb-8">Your booking has been confirmed.</p>

            <!-- Details -->
            <div class="text-left space-y-4 bg-muted/30 p-6 rounded-lg mb-8">
                <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Booking ID</span>
                    <span class="font-medium text-foreground">{{ booking.bookingId }}</span>
                </div>
                 <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Transaction ID</span>
                    <span class="font-medium text-foreground">{{ booking.transactionId }}</span>
                </div>
                 <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Amount Paid</span>
                    <span class="font-bold text-primary">₹{{ booking.totalAmount }}</span>
                </div>
                 <div class="flex justify-between border-t border-border pt-4 mt-2">
                    <span class="text-sm text-muted-foreground">Room</span>
                    <span class="font-medium text-foreground">Room {{ booking.room?.roomNumber }} ({{ booking.room?.roomType }})</span>
                </div>
                 <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Move-in Date</span>
                    <span class="font-medium text-foreground">{{ booking.moveInDate | date:'dd-MM-yyyy' }}</span>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <app-button (click)="downloadReceipt()" variant="outline">
                    Download Receipt
                </app-button>
                <app-button (click)="goToBookings()">
                    My Bookings
                </app-button>
            </div>
        </div>
      }
    </div>
  `
})
export class BookingSuccessComponent implements OnInit {
    bookingId: string = '';
    booking: Booking | null = null;
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private invoiceService: InvoiceService
    ) { }

    ngOnInit() {
        this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
        if (this.bookingId) {
            this.fetchBooking();
        }
    }

    fetchBooking() {
        this.isLoading = true;
        this.bookingService.getBookingById(this.bookingId).subscribe({
            next: (response) => {
                this.booking = response.data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading booking details', err);
                this.isLoading = false;
            }
        });
    }

    downloadReceipt() {
        if (this.booking) {
            this.invoiceService.generateInvoice(this.booking);
        }
    }

    goToBookings() {
        this.router.navigate(['/tenant/history']);
    }
}
