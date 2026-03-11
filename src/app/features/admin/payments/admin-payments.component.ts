import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AdminPaymentService, AdminBillResponse } from '../../../core/services/admin-payment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent],
    template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Payment Management</h1>
          <p class="text-muted-foreground mt-1">Track and manage rent and other payments</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-64">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadPayments()"
              placeholder="Search by tenant name..."
              class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <select [(ngModel)]="filterStatus" (change)="loadPayments()" class="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto">
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
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
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Bill Date</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Due Date</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (payment of payments; track payment.billId) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-medium text-foreground">{{ payment.tenantName }}</div>
                      <div class="text-xs text-muted-foreground">{{ payment.tenantPhone }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm text-foreground">Room {{ payment.roomNumber }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">{{ payment.billDate | date:'mediumDate' }}</td>
                    <td class="py-3 px-4 text-sm" [class.text-destructive]="isOverdue(payment.dueDate) && payment.paymentStatus !== 'PAID'">
                      {{ payment.dueDate | date:'mediumDate' }}
                      @if (isOverdue(payment.dueDate) && payment.paymentStatus !== 'PAID') {
                        <span class="block text-[10px] uppercase font-bold">Overdue</span>
                      }
                    </td>
                    <td class="py-3 px-4">
                      <div class="text-sm font-bold text-foreground">₹{{ payment.totalAmount }}</div>
                      @if (payment.balanceAmount > 0) {
                        <div class="text-[10px] text-destructive">Balance: ₹{{ payment.balanceAmount }}</div>
                      }
                    </td>
                    <td class="py-3 px-4">
                      <span [class]="getStatusClass(payment.paymentStatus)">{{ payment.paymentStatus }}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex justify-end gap-1">
                        @if (payment.paymentStatus !== 'PAID') {
                          <app-button variant="ghost" size="sm" class="text-primary" (click)="openReceiveModal(payment)">Receive</app-button>
                        }
                        <app-button variant="ghost" size="sm" class="text-muted-foreground" (click)="onGenerateReceipt(payment.billId)">Receipt</app-button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-muted-foreground">No payments found.</td>
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

    <!-- Mark Received Modal -->
    <app-modal
      [isOpen]="isReceiveModalOpen"
      [title]="'Mark Payment Received - ' + selectedBill?.tenantName"
      size="md"
      (close)="isReceiveModalOpen = false"
    >
      <div class="space-y-4 p-1">
        <div class="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Remaining Balance:</span>
            <span class="font-bold text-foreground">₹{{ selectedBill?.balanceAmount }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Original Total:</span>
            <span class="text-foreground">₹{{ selectedBill?.totalAmount }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Amount Received</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <input 
              type="number" 
              [(ngModel)]="receiveAmount" 
              class="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="0.00"
            >
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Payment Method</label>
          <select 
            [(ngModel)]="receiveMethod" 
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CARD">Credit/Debit Card</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <app-button variant="ghost" type="button" (click)="isReceiveModalOpen = false">Cancel</app-button>
        <app-button (click)="onReceiveSubmit()" [disabled]="!receiveAmount || receiveAmount <= 0 || isSubmitting">
          @if (isSubmitting) { <span>Processing...</span> } @else { <span>Record Payment</span> }
        </app-button>
      </div>
    </app-modal>
  `,
    styles: []
})
export class AdminPaymentsComponent implements OnInit {
    payments: AdminBillResponse[] = [];
    isLoading = false;
    isSubmitting = false;
    searchQuery = '';
    filterStatus = '';
    currentPage = 0;
    pageSize = 10;
    totalPages = 0;

    // Modal State
    isReceiveModalOpen = false;
    selectedBill: AdminBillResponse | null = null;
    receiveAmount: number = 0;
    receiveMethod: string = 'CASH';

    constructor(
        private adminPaymentService: AdminPaymentService,
        private toastService: ToastService,
        private invoiceService: InvoiceService
    ) { }

    ngOnInit() {
        this.loadPayments();
    }

    loadPayments() {
        this.isLoading = true;
        this.adminPaymentService.getPayments(this.filterStatus, this.searchQuery, this.currentPage, this.pageSize).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.payments = res.data.content;
                    this.totalPages = res.data.totalPages;
                }
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('Failed to load payments.');
                this.isLoading = false;
            }
        });
    }

    loadPage(page: number) {
        this.currentPage = page;
        this.loadPayments();
    }

    getStatusClass(status: string): string {
        const base = 'px-2 py-0.5 rounded-full text-[10px] font-bold ';
        switch (status) {
            case 'PAID': return base + 'bg-success/10 text-success';
            case 'PENDING': return base + 'bg-yellow-500/10 text-yellow-600';
            case 'PARTIAL': return base + 'bg-primary/10 text-primary';
            default: return base + 'bg-muted text-muted-foreground';
        }
    }

    isOverdue(dueDate: string | null): boolean {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    openReceiveModal(payment: AdminBillResponse) {
        this.selectedBill = payment;
        this.receiveAmount = payment.balanceAmount;
        this.receiveMethod = 'CASH';
        this.isReceiveModalOpen = true;
    }

    onReceiveSubmit() {
        if (!this.selectedBill || !this.receiveAmount) return;
        this.isSubmitting = true;
        this.adminPaymentService.markReceived(this.selectedBill.billId, this.receiveAmount, this.receiveMethod).subscribe({
            next: () => {
                this.toastService.success('Payment recorded successfully.');
                this.isReceiveModalOpen = false;
                this.loadPayments();
                this.isSubmitting = false;
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to record payment.');
                this.isSubmitting = false;
            }
        });
    }

    onGenerateReceipt(billId: string) {
        const payment = this.payments.find(p => p.billId === billId);
        if (!payment) return;

        this.adminPaymentService.generateReceipt(billId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Receipt generated.');
                    
                    // Construct a booking-like object for InvoiceService
                    const mockBooking: any = {
                        bookingId: payment.billId, // Fallback ID
                        _id: payment.billId,
                        totalAmount: payment.totalAmount,
                        paymentStatus: payment.paymentStatus,
                        paymentMethod: res.data?.paymentMethod || 'N/A',
                        transactionId: res.data?.transactionId || 'N/A',
                        moveInDate: payment.billDate,
                        room: {
                            roomNumber: payment.roomNumber,
                            price: payment.totalAmount,
                            roomType: 'PG Room'
                        },
                        user: {
                            name: payment.tenantName,
                            phone: payment.tenantPhone,
                            email: 'N/A'
                        },
                        payment: {
                            paymentMethod: res.data?.paymentMethod || 'N/A',
                            balanceAmount: payment.balanceAmount
                        }
                    };
                    
                    try {
                        this.invoiceService.generateInvoice(mockBooking);
                    } catch (error) {
                        console.error('PDF generation failed', error);
                        this.toastService.error('Failed to create PDF file.');
                    }
                }
            },
            error: () => this.toastService.error('Failed to generate receipt.')
        });
    }
}
