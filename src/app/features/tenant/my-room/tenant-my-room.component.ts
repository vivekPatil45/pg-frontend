import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TenantService } from '../../../core/services/tenant.service';
import { Booking } from '../../../models/booking.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-tenant-my-room',
    standalone: true,
    imports: [CommonModule, RouterModule, StatusBadgeComponent, ButtonComponent, LoadingSpinnerComponent],
    template: `
    <div class="space-y-6 animate-fade-in relative">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Room</h1>
        <p class="text-muted-foreground mt-1">View your current stay details and upcoming payments</p>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (booking) {
        <!-- Status Banner -->
        <div 
            class="rounded-xl p-4 flex items-center gap-4 border shadow-sm"
            [ngClass]="{
                'bg-amber-100 border-amber-200 text-amber-900': booking.status === 'PENDING',
                'bg-blue-100 border-blue-200 text-blue-900': booking.status === 'CONFIRMED',
                'bg-green-100 border-green-200 text-green-900': booking.status === 'ACTIVE'
            }"
        >
            <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                [ngClass]="{
                    'bg-amber-200 text-amber-700': booking.status === 'PENDING',
                    'bg-blue-200 text-blue-700': booking.status === 'CONFIRMED',
                    'bg-green-200 text-green-700': booking.status === 'ACTIVE'
                }"
            >
                @if (booking.status === 'PENDING') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                } @else if (booking.status === 'CONFIRMED') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                } @else {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                }
            </div>
            <div>
                <h3 class="font-bold text-lg">
                    @if (booking.status === 'PENDING') { Booking Pending Approval }
                    @else if (booking.status === 'CONFIRMED') { Booking Confirmed }
                    @else { Active Stay }
                </h3>
                <p class="text-sm opacity-90">
                    @if (booking.status === 'PENDING') { Your booking request and initial payment have been received. An admin will review it shortly. }
                    @else if (booking.status === 'CONFIRMED') { 
                        @if (booking.bedId) {
                            Your room is ready! Bed {{ bedNumber }} has been assigned. Move in on {{ booking.moveInDate | date:'mediumDate' }}.
                        } @else {
                            Your room is confirmed! Move in on {{ booking.moveInDate | date:'mediumDate' }}. Bed assignment is pending.
                        }
                    }
                    @else { Enjoy your stay at SilverPG! }
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Details -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Room Card -->
                <div class="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div class="bg-primary p-6 text-primary-foreground flex justify-between items-start">
                        <div>
                            <p class="text-primary-foreground/80 font-medium uppercase tracking-wider text-xs mb-1">Assigned Room</p>
                            <h2 class="text-3xl font-bold">Room {{ booking.room?.roomNumber }}</h2>
                            <p class="mt-2 flex items-center gap-2">
                                <span class="bg-primary-foreground/20 px-2 py-1 rounded text-xs font-semibold uppercase">{{ booking.room?.roomType?.replace('_', ' ') }}</span>
                                @if (booking.bedId) {
                                  <span class="bg-green-500/20 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    Bed {{ bedNumber }}
                                  </span>
                                } @else {
                                  <span class="bg-amber-500/20 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Bed Assignment Pending
                                  </span>
                                }
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-primary-foreground/80 font-medium uppercase tracking-wider text-xs mb-1">Monthly Rent</p>
                            <p class="text-3xl font-bold">₹{{ booking.room?.price }}</p>
                        </div>
                    </div>
                    
                    <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <p class="text-muted-foreground mb-1">Floor</p>
                            <p class="font-medium text-foreground">{{ booking.room?.floor || 1 }}{{ getOrdinal(booking.room?.floor || 1) }} Floor</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground mb-1">Size</p>
                            <p class="font-medium text-foreground">{{ booking.room?.roomSize || 180 }} sq ft</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground mb-1">Move-in Date</p>
                            <p class="font-medium text-foreground">{{ booking.moveInDate | date:'dd-MM-yyyy' }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground mb-1">Booking ID</p>
                            <p class="font-medium text-foreground">{{ booking.bookingId }}</p>
                        </div>
                    </div>
                </div>

                <!-- Facilities -->
                <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-foreground mb-4">Room Amenities</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        @for (amenity of booking.room?.amenities; track amenity) {
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                                <div class="text-primary" [innerHTML]="getAmenityIcon(amenity)"></div>
                                <span class="text-sm font-medium">{{ amenity }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <!-- Right Column: Payments & Actions -->
            <div class="space-y-6">
                <!-- Payment Summary -->
                <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-foreground mb-4 flex items-center justify-between">
                        Payment Overview
                        <app-status-badge [status]="booking.paymentStatus"></app-status-badge>
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-end border-b border-border pb-4">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Next Due Date</p>
                                <p class="text-lg font-bold text-destructive">{{ nextDueDate | date:'longDate' }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-muted-foreground">Amount Due</p>
                                <p class="text-xl font-bold text-foreground">₹{{ booking.room?.price }}</p>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-muted-foreground">Last Payment</span>
                            <span class="font-medium">{{ booking.updatedAt | date:'mediumDate' }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-muted-foreground">Transaction ID</span>
                            <span class="font-mono">{{ booking.transactionId || 'N/A' }}</span>
                        </div>
                        
                        <app-button class="w-full mt-2 group" (click)="payRent()">
                            Pay Rent Early
                            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </app-button>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <button routerLink="/tenant/complaints" class="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="bg-primary/10 text-primary p-2 rounded-md">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                </div>
                                <span class="font-medium text-sm">Raise a Complaint</span>
                            </div>
                            <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                        
                        <button routerLink="/tenant/history" class="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="bg-secondary/20 text-secondary-foreground p-2 rounded-md">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2z"/></svg>
                                </div>
                                <span class="font-medium text-sm">View Payment History</span>
                            </div>
                            <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      } @else {
        <div class="bg-card rounded-xl border border-border p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div class="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <h2 class="text-2xl font-bold text-foreground mb-2">No Room Assigned</h2>
            <p class="text-muted-foreground mb-8">You don't have an active stay or pending booking yet. Browse our available rooms to find your perfect stay.</p>
            <app-button routerLink="/tenant/rooms" size="lg">Browse Available Rooms</app-button>
        </div>
      }
    </div>
  `
})
export class TenantMyRoomComponent implements OnInit {
    isLoading = true;
    booking: Booking | null = null;
    bedNumber: string = '';
    nextDueDate: Date = new Date();

    constructor(
        private tenantService: TenantService,
        private router: Router,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.fetchActiveStay();
    }

    fetchActiveStay() {
        this.isLoading = true;
        this.tenantService.getActiveStay().subscribe({
            next: (res) => {
                this.booking = res.data;
                if (this.booking) {
                    // Calculate next due date (1st of next month)
                    const moveIn = new Date(this.booking.moveInDate || new Date());
                    this.nextDueDate = new Date(moveIn.getFullYear(), moveIn.getMonth() + 1, 1);

                    // Extract bed number if possible from ID
                    if (this.booking.bedId) {
                        this.bedNumber = this.booking.bedId.split('-').pop() || this.booking.bedId;
                    } else {
                        this.bedNumber = '';
                    }
                }
                this.isLoading = false;
            },
            error: () => {
                // Normal if no active stay exists
                this.booking = null;
                this.isLoading = false;
            }
        });
    }

    getAmenityIcon(amenity: string): SafeHtml {
        const icons: { [key: string]: string } = {
            'WiFi': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
            'Food': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/></svg>',
            'Laundry': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
            'AC': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
            'TV': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2M17 4V2M5 8h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"/></svg>',
            'Cleaning': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
            'Parking': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>',
        };

        const defaultIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

        const iconStr = icons[amenity] || Object.entries(icons).find(([k]) => amenity.toLowerCase().includes(k.toLowerCase()))?.[1] || defaultIcon;

        return this.sanitizer.bypassSecurityTrustHtml(iconStr);
    }

    getOrdinal(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    payRent() {
        // Generate mock bill and navigate to payment
        this.router.navigate(['/tenant/payment', this.booking?.bookingId]);
    }
}
