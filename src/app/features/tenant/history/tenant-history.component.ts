import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Booking } from '../../../models/booking.model';
import { Bill } from '../../../models/bill.model';
import { BookingService } from '../../../core/services/booking.service';
import { TenantService } from '../../../core/services/tenant.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CancelBookingModalComponent } from './cancel-booking-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-tenant-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    CancelBookingModalComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in relative">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Booking History</h1>
        <p class="text-muted-foreground mt-1">
          View your past and upcoming bookings
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 border-b border-border">
        <button 
          class="pb-2 px-1 font-medium transition-colors border-b-2"
          [class.border-primary]="activeTab === 'upcoming'"
          [class.text-primary]="activeTab === 'upcoming'"
          [class.border-transparent]="activeTab !== 'upcoming'"
          [class.text-muted-foreground]="activeTab !== 'upcoming'"
          [class.hover:text-foreground]="activeTab !== 'upcoming'"
          (click)="activeTab = 'upcoming'"
        >
          Upcoming Bookings
        </button>
        <button 
          class="pb-2 px-1 font-medium transition-colors border-b-2"
          [class.border-primary]="activeTab === 'past'"
          [class.text-primary]="activeTab === 'past'"
          [class.border-transparent]="activeTab !== 'past'"
          [class.text-muted-foreground]="activeTab !== 'past'"
          [class.hover:text-foreground]="activeTab !== 'past'"
          (click)="activeTab = 'past'"
        >
          Past Bookings
        </button>
        <button 
          class="pb-2 px-1 font-medium transition-colors border-b-2"
          [class.border-primary]="activeTab === 'bills'"
          [class.text-primary]="activeTab === 'bills'"
          [class.border-transparent]="activeTab !== 'bills'"
          [class.text-muted-foreground]="activeTab !== 'bills'"
          [class.hover:text-foreground]="activeTab !== 'bills'"
          (click)="activeTab = 'bills'"
        >
          Bills & Payments
        </button>
      </div>

      @if (isLoading || isLoadingBills) {
         <div class="flex justify-center py-12">
            <app-loading-spinner size="lg"></app-loading-spinner>
         </div>
      } @else if (activeTab === 'bills') {
        @if (bills.length > 0) {
          <div class="bg-card rounded-xl border border-border overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-muted/50 border-b border-border">
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Bill ID</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Description</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                    <th class="text-center py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  @for (bill of bills; track bill.billId) {
                    <tr class="hover:bg-muted/50 transition-colors">
                      <td class="py-3 px-4 font-medium">{{ bill.billId }}</td>
                      <td class="py-3 px-4">
                        @if (bill.items && bill.items.length > 0) {
                          {{ bill.items[0].description }}
                          @if (bill.items.length > 1) {
                            <span class="text-xs text-muted-foreground">(+{{ bill.items.length - 1 }} more)</span>
                          }
                        } @else {
                          Monthly Rent / Charges
                        }
                      </td>
                      <td class="py-3 px-4 text-sm">{{ bill.billDate | date:'mediumDate' }}</td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-foreground">₹{{ bill.totalAmount }}</div>
                        @if (bill.balanceAmount > 0 && bill.paymentStatus !== 'PAID') {
                          <div class="text-[10px] text-amber-500 italic">Balance: ₹{{ bill.balanceAmount }}</div>
                        }
                      </td>
                      <td class="py-3 px-4">
                        <app-status-badge [status]="bill.paymentStatus"></app-status-badge>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex justify-center gap-2">
                          @if (bill.paymentStatus !== 'PAID') {
                            <button class="text-xs font-bold px-3 py-1.5 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors" [routerLink]="['/tenant/payment', bill.booking?.bookingId]">
                              Pay Now
                            </button>
                          }
                          <button class="text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors flex items-center gap-1" (click)="downloadBillInvoice(bill)">
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <div class="text-center py-12 bg-card rounded-xl border border-border shadow-sm">
            <h3 class="text-lg font-medium text-foreground mb-2">No bills found</h3>
            <p class="text-muted-foreground">You don't have any generated bills at the moment.</p>
          </div>
        }
      } @else if (filteredBookings.length > 0) {
        <div class="bg-card rounded-xl border border-border overflow-hidden">
            <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                <tr class="bg-muted/50 border-b border-border">
                 <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Booking ID</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Accommodation &amp; Room</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Dates</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Status</th>
                    <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Amount</th>
                    <th class="text-center py-3 px-4 font-medium text-muted-foreground text-sm whitespace-nowrap">Actions</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-border">
                @for (booking of filteredBookings; track booking.bookingId) {
                    <tr class="hover:bg-muted/50 transition-colors">
                    <td class="py-3 px-4">
                        <button class="font-medium text-primary hover:underline text-left outline-none" (click)="openDetails(booking)">
                           {{ booking.bookingId }}
                        </button>
                        @if (booking.status === 'CANCELLED') {
                             <div class="text-[10px] text-destructive mt-1">
                                Cancelled on {{ (booking.cancellationDate || booking.updatedAt) | date:'mediumDate' }}
                             </div>
                        }
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-medium text-foreground whitespace-nowrap">Silver PG, Pune</div>
                        <div class="text-xs text-muted-foreground whitespace-nowrap">{{ booking.room?.roomType }} (Room {{ booking.room?.roomNumber }})</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">
                        <div>Move In: {{ booking.moveInDate | date:'dd-MM-yyyy' }}</div>
                    </td>
                    <td class="py-3 px-4">
                        <app-status-badge [status]="booking.status"></app-status-badge>
                        @if (booking.paymentStatus === 'PENDING') {
                            <div class="text-[10px] text-amber-500 mt-1">Payment Pending</div>
                        }
                    </td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">
                        ₹{{ booking.totalAmount }}
                    </td>
                    <td class="py-3 px-4">
                        <!-- Upcoming Actions -->
                        @if (activeTab === 'upcoming' && booking.status !== 'CANCELLED') {
                            <div class="flex flex-col gap-1.5 min-w-[120px]">
                                <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors" (click)="openDetails(booking)">
                                    View Details
                                </button>
                                @if (booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'PARTIAL' || booking.status === 'PENDING_PAYMENT') {
                                    <button class="w-full text-xs font-bold px-3 py-1.5 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm" [routerLink]="['/tenant/payment', booking.bookingId]">
                                        Pay Balance
                                    </button>
                                } @else {
                                    <div class="flex gap-1.5">
                                        <button class="flex-1 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors" [routerLink]="['/tenant/modify-booking', booking.bookingId]">
                                            Modify
                                        </button>
                                        <button class="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-destructive hover:bg-destructive/90 text-white transition-colors" (click)="openCancelModal(booking)">
                                            Cancel
                                        </button>
                                    </div>
                                    <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1" (click)="downloadInvoiceOrWarn(booking)">
                                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Invoice
                                    </button>
                                }
                            </div>
                        } @else {
                            <!-- Past/Cancelled Actions -->
                            <div class="flex flex-col gap-1.5 min-w-[120px]">
                                <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors" (click)="openDetails(booking)">
                                    View Details
                                </button>
                                @if (booking.status !== 'CANCELLED') {
                                    <button class="w-full text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1" (click)="downloadInvoiceOrWarn(booking)">
                                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Invoice
                                    </button>
                                }
                            </div>
                        }
                    </td>
                    </tr>
                }
                </tbody>
            </table>
            </div>
        </div>
      } @else {
         <div class="text-center py-12 bg-card rounded-xl border border-border shadow-sm">
            <h3 class="text-lg font-medium text-foreground mb-2">No bookings found</h3>
            <p class="text-muted-foreground mb-6">You don't have any {{ activeTab }} bookings yet.</p>
            <app-button [routerLink]="['/tenant/home']">Explore Rooms</app-button>
         </div>
      }
    </div>

      <!-- Booking Details Modal -->
      @if (selectedBooking) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div class="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 relative max-h-[90vh] overflow-y-auto">
            <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" (click)="closeDetails()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">Booking Details</h2>
            
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <p class="text-sm text-muted-foreground">Booking ID</p>
                    <p class="font-medium">{{ selectedBooking.bookingId }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Status</p>
                    <app-status-badge [status]="selectedBooking.status"></app-status-badge>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Accommodation</p>
                    <p class="font-medium">Silver PG</p>
                    <p class="text-sm text-muted-foreground">12, Koregaon Park Road, Pune</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Room</p>
                    <p class="font-medium">{{ selectedBooking.room?.roomType }}</p>
                    <p class="text-sm text-muted-foreground">Room: {{ selectedBooking.room?.roomNumber }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Move-in Date</p>
                    <p class="font-medium">{{ selectedBooking.moveInDate | date:'dd-MM-yyyy' }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Total Amount</p>
                    <p class="font-bold text-lg text-primary">₹{{ selectedBooking.totalAmount }}</p>
                    <p class="text-xs" [class.text-green-600]="selectedBooking.paymentStatus === 'PAID'" [class.text-amber-500]="selectedBooking.paymentStatus !== 'PAID'">
                        Payment: {{ selectedBooking.paymentStatus }}
                    </p>
                </div>
            </div>

            @if (selectedBooking.status === 'CANCELLED') {
                <div class="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
                    <p class="font-medium">This booking was cancelled.</p>
                    @if(selectedBooking.cancellationReason) {
                        <p class="text-sm mt-1">Reason: {{ selectedBooking.cancellationReason }}</p>
                    }
                </div>
            }

            <div class="flex justify-end space-x-3 border-t border-border pt-4">
               @if (selectedBooking.status === 'PENDING_PAYMENT' || selectedBooking.status === 'CONFIRMED') {
                    <app-button variant="destructive" (click)="openCancelModal(selectedBooking); closeDetails()">Cancel Booking</app-button>
               }
               <app-button variant="outline" (click)="downloadInvoiceOrWarn(selectedBooking)">Download Invoice</app-button>
               <app-button (click)="closeDetails()">Close</app-button>
            </div>
          </div>
        </div>
    }

    <!-- Cancel Booking Modal -->
    @if (bookingToCancel) {
        <app-cancel-booking-modal
            [isOpen]="true"
            [booking]="bookingToCancel"
            (modalClosed)="onCancelModalClosed($event)"
        ></app-cancel-booking-modal>
    }
  `,
  styles: []
})
export class TenantHistoryComponent implements OnInit {
  bookings: Booking[] = [];
  bills: Bill[] = [];
  isLoading = true;
  isLoadingBills = false;
  activeTab: 'upcoming' | 'past' | 'bills' = 'upcoming';
  selectedBooking: Booking | null = null;
  error = '';
  bookingToCancel: Booking | null = null;

  constructor(
    private bookingService: BookingService,
    private tenantService: TenantService,
    private invoiceService: InvoiceService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.fetchBookings();
    this.fetchBills();
  }

  fetchBills() {
    this.isLoadingBills = true;
    this.tenantService.getMyBills().subscribe({
      next: (res) => {
        this.bills = res.data.content || [];
        this.isLoadingBills = false;
      },
      error: (err) => {
        console.error('Error fetching bills', err);
        this.isLoadingBills = false;
      }
    });
  }

  fetchBookings() {
    this.isLoading = true;
    this.error = '';
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res.data.content || [];
        // Sort by dates descending by default
        this.bookings.sort((a, b) => new Date(b.moveInDate).getTime() - new Date(a.moveInDate).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching bookings', err);
      }
    });
  }

  get filteredBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return this.bookings.filter(booking => {
      if (this.activeTab === 'upcoming') {
        return booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
      } else {
        return booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
      }
    });
  }

  openDetails(booking: Booking) {
    this.selectedBooking = booking;
  }

  closeDetails() {
    this.selectedBooking = null;
  }

  openCancelModal(booking: Booking) {
    this.bookingToCancel = booking;
  }

  onCancelModalClosed(success: boolean) {
    this.bookingToCancel = null;
    if (success) {
      this.fetchBookings(); // Refresh list to show updated status
    }
  }

  downloadInvoiceOrWarn(booking: Booking) {
    if (booking.paymentStatus !== 'PAID') {
      this.toastService.error('Invoice will be available after full payment.');
      return;
    }

    try {
      this.invoiceService.generateInvoice(booking);
    } catch (error) {
      console.error('Invoice generation failed', error);
      this.toastService.error('Unable to generate invoice. Please try again later.');
    }
  }

  downloadBillInvoice(bill: Bill) {
    if (bill.paymentStatus !== 'PAID') {
      this.toastService.error('Receipt will be available after full payment.');
      return;
    }

    // Reuse invoice service if it supports bill objects or adapt it
    // For now, minimal mock implementation
    this.toastService.success('Downloading receipt for bill ' + bill.billId);
  }

}
