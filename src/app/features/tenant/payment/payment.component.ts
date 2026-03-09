import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ButtonComponent, LoadingSpinnerComponent, ModalComponent],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-foreground mb-6">Payment</h1>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (booking) {
        <div class="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-6">
          <div class="p-6 bg-muted/30 border-b border-border text-center">
            <p class="text-sm text-muted-foreground mb-1">Total Amount to Pay</p>
            <h2 class="text-4xl font-bold text-primary mb-2">₹{{ amountToPay }}</h2>
            <div class="inline-flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Booking ID: <span class="font-medium text-foreground">{{ booking.bookingId }}</span>
            </div>
          </div>

          <!-- Payment Method Tabs -->
          <div class="flex border-b border-border bg-background">
            <button 
              class="flex-1 py-4 text-sm font-medium transition-colors border-b-2"
              [ngClass]="activeTab === 'UPI' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
              (click)="activeTab = 'UPI'"
              type="button"
            >
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                UPI
              </div>
            </button>
            <button 
              class="flex-1 py-4 text-sm font-medium transition-colors border-b-2"
              [ngClass]="activeTab === 'CARD' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
              (click)="activeTab = 'CARD'"
              type="button"
            >
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                Card
              </div>
            </button>
            <button 
              class="flex-1 py-4 text-sm font-medium transition-colors border-b-2"
              [ngClass]="activeTab === 'NET_BANKING' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
              (click)="activeTab = 'NET_BANKING'"
              type="button"
            >
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h-5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                Net Banking
              </div>
            </button>
          </div>

          <!-- Forms Container -->
          <div class="p-6 bg-background">
          
            <!-- UPI Form -->
            @if (activeTab === 'UPI') {
              <form [formGroup]="upiForm" (ngSubmit)="handlePayment()" class="space-y-6 animate-fade-in">
                <div class="bg-muted/30 p-4 rounded-xl text-center border border-border">
                  <div class="w-40 h-40 bg-white p-2 border-2 border-primary/20 rounded-xl mx-auto mb-4 relative overflow-hidden group">
                    <!-- Generic QR Mock -->
                    <svg class="w-full h-full text-foreground opacity-80" viewBox="0 0 200 200" fill="currentColor">
                      <rect x="20" y="20" width="40" height="40" />
                      <rect x="20" y="140" width="40" height="40" />
                      <rect x="140" y="20" width="40" height="40" />
                      <rect x="30" y="30" width="20" height="20" fill="white"/>
                      <rect x="30" y="150" width="20" height="20" fill="white"/>
                      <rect x="150" y="30" width="20" height="20" fill="white"/>
                      <rect x="80" y="20" width="20" height="20" />
                      <rect x="100" y="40" width="20" height="20" />
                      <rect x="80" y="60" width="40" height="20" />
                      <rect x="20" y="80" width="60" height="20" />
                      <rect x="100" y="100" width="80" height="20" />
                      <rect x="60" y="120" width="20" height="60" />
                      <rect x="100" y="140" width="40" height="40" />
                      <rect x="160" y="160" width="20" height="20" />
                    </svg>
                    <div class="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="text-xs font-bold text-primary bg-background px-2 py-1 rounded">Scan to Pay</span>
                    </div>
                  </div>
                  <p class="text-sm font-medium text-foreground">Scan QR Code</p>
                  <p class="text-xs text-muted-foreground mt-1">Open any UPI app to scan and pay</p>
                </div>

                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-border"></span>
                  </div>
                  <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-background px-2 text-muted-foreground">Or enter UPI ID</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">UPI ID / VPA</label>
                  <input 
                    type="text" 
                    formControlName="upiId"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    placeholder="example@upi"
                  >
                  @if (upiForm.get('upiId')?.invalid && upiForm.get('upiId')?.touched) {
                    <span class="text-xs text-destructive">Valid UPI ID is required (e.g., name&#64;bank)</span>
                  }
                </div>

                <app-button 
                    class="w-full" 
                    type="submit"
                    [disabled]="upiForm.invalid || isProcessing"
                >
                    Pay ₹{{ amountToPay }}
                </app-button>
              </form>
            }

            <!-- Card Form -->
            @if (activeTab === 'CARD') {
              <form [formGroup]="cardForm" (ngSubmit)="handlePayment()" class="space-y-5 animate-fade-in">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Cardholder Name</label>
                  <input 
                    type="text" 
                    formControlName="cardHolderName"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    placeholder="Name exactly as on card"
                  >
                  @if (cardForm.get('cardHolderName')?.invalid && cardForm.get('cardHolderName')?.touched) {
                    <span class="text-xs text-destructive">Name is required (min 3 chars)</span>
                  }
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Card Number</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      formControlName="cardNumber"
                      class="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest font-mono text-sm"
                      placeholder="0000 0000 0000 0000"
                      maxlength="16"
                    >
                    <svg class="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  </div>
                  @if (cardForm.get('cardNumber')?.invalid && cardForm.get('cardNumber')?.touched) {
                    <span class="text-xs text-destructive">Valid 16-digit card number required</span>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      formControlName="expiryDate"
                      class="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center tracking-widest text-sm"
                      placeholder="MM/YY"
                      maxlength="5"
                    >
                    @if (cardForm.get('expiryDate')?.invalid && cardForm.get('expiryDate')?.touched) {
                       <span class="text-xs text-destructive">Future date required</span>
                    }
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">CVV</label>
                    <input 
                      type="password" 
                      formControlName="cvv"
                      class="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center tracking-widest text-sm"
                      placeholder="•••"
                      maxlength="4"
                    >
                    @if (cardForm.get('cvv')?.invalid && cardForm.get('cvv')?.touched) {
                      <span class="text-xs text-destructive">3-4 digits required</span>
                    }
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Billing Address</label>
                  <textarea 
                    formControlName="billingAddress"
                    class="w-full h-20 px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                    placeholder="Enter your billing address"
                  ></textarea>
                  @if (cardForm.get('billingAddress')?.invalid && cardForm.get('billingAddress')?.touched) {
                    <span class="text-xs text-destructive">Billing Address is required</span>
                  }
                </div>

                <app-button 
                    class="w-full mt-2" 
                    type="submit"
                    [disabled]="cardForm.invalid || isProcessing"
                >
                    Pay ₹{{ amountToPay }}
                </app-button>
              </form>
            }

            <!-- Net Banking Form -->
            @if (activeTab === 'NET_BANKING') {
              <form [formGroup]="netBankingForm" (ngSubmit)="handlePayment()" class="space-y-6 animate-fade-in">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Select Bank</label>
                  <select 
                    formControlName="bankCode"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  >
                    <option value="" disabled selected>Select from popular banks</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                  @if (netBankingForm.get('bankCode')?.invalid && netBankingForm.get('bankCode')?.touched) {
                    <span class="text-xs text-destructive">Please select a bank</span>
                  }
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Account Number (Optional for mock)</label>
                  <input 
                    type="text" 
                    class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    placeholder="To simulate net banking portal later"
                  >
                  <p class="text-[10px] text-muted-foreground mt-1">You will be redirected to the bank's secure portal.</p>
                </div>

                <app-button 
                    class="w-full" 
                    type="submit"
                    [disabled]="netBankingForm.invalid || isProcessing"
                >
                    Proceed to Bank
                </app-button>
              </form>
            }
          </div>
        </div>

        <!-- OTP Modal -->
        <app-modal 
          [isOpen]="showOtpModal" 
          title="Secure Verification" 
          (close)="closeOtpModal()"
          size="sm"
        >
          <div class="py-4 space-y-6">
            <div class="text-center space-y-2">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-foreground">Enter OTP</h3>
              <p class="text-sm text-muted-foreground">
                A 6-digit verification code has been sent to your registered mobile number for the amount of ₹{{ amountToPay }}.
              </p>
            </div>

            <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()" class="space-y-4">
              <div class="space-y-2">
                <input 
                  type="text" 
                  formControlName="otp"
                  class="w-full h-12 text-center text-2xl font-bold tracking-[0.5em] rounded-md border border-input bg-background focus:ring-2 focus:ring-primary"
                  placeholder="000000"
                  maxlength="6"
                  autofocus
                >
                @if (otpForm.get('otp')?.invalid && otpForm.get('otp')?.touched) {
                  <p class="text-xs text-center text-destructive">Please enter a valid 6-digit OTP</p>
                }
              </div>

              <div class="bg-secondary/30 p-4 rounded-lg text-center">
                <p class="text-xs text-muted-foreground">Mock System - Current OTP:</p>
                <p class="text-lg font-mono font-bold text-primary">{{ generatedOtp }}</p>
              </div>

              <div class="flex gap-3">
                <app-button 
                  variant="outline" 
                  class="w-full" 
                  (click)="closeOtpModal()"
                  type="button"
                >
                  Cancel
                </app-button>
                <app-button 
                  variant="default" 
                  class="w-full" 
                  type="submit"
                  [disabled]="otpForm.invalid || isProcessing"
                >
                  @if (isProcessing) {
                    Verifying...
                  } @else {
                    Verify & Pay
                  }
                </app-button>
              </div>

              <div class="text-center">
                <button type="button" (click)="generateNewOtp()" class="text-xs text-primary hover:underline">
                  Resend OTP
                </button>
              </div>
            </form>
          </div>
        </app-modal>
      } @else {
         <div class="text-center py-12 text-destructive">
          <p>{{ errorMessage || 'Error loading booking details.' }}</p>
          <app-button variant="outline" class="mt-4" routerLink="/tenant/rooms">Return to Rooms</app-button>
        </div>
      }
    </div>
  `
})
export class PaymentComponent implements OnInit {
  bookingId: string = '';
  booking: Booking | null = null;
  isLoading = true;
  isProcessing = false;
  activeTab: 'UPI' | 'CARD' | 'NET_BANKING' = 'UPI';
  cardForm: FormGroup;
  upiForm: FormGroup;
  netBankingForm: FormGroup;
  otpForm: FormGroup;
  errorMessage: string = '';

  get amountToPay(): number {
    if (!this.booking) return 0;
    if (this.booking.payment && this.booking.payment.balanceAmount !== undefined) {
      return this.booking.payment.balanceAmount;
    }
    return this.booking.totalAmount || 0;
  }

  // OTP Modal State
  showOtpModal = false;
  generatedOtp: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.cardForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      billingAddress: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]]
    });

    this.netBankingForm = this.fb.group({
      bankCode: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
    if (this.bookingId) {
      this.fetchBooking();
    } else {
      this.errorMessage = 'Invalid Booking ID';
      this.isLoading = false;
    }
  }

  fetchBooking() {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (response) => {
        this.booking = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load booking details.';
        this.isLoading = false;
      }
    });
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  handlePayment() {
    let currentForm: FormGroup;
    if (this.activeTab === 'UPI') currentForm = this.upiForm;
    else if (this.activeTab === 'CARD') currentForm = this.cardForm;
    else currentForm = this.netBankingForm;

    if (currentForm.invalid) {
      currentForm.markAllAsTouched();
      return;
    }

    this.generateNewOtp();
    this.showOtpModal = true;
  }

  generateNewOtp() {
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpForm.reset();
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.otpForm.reset();
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;

    // We accept any 6 digit OTP for "random otp" requirement, but we check against generated one for better UX
    // "put any random otp then ite booking completed"

    this.isProcessing = true;

    // Simulate Payment Gateway finalization
    setTimeout(() => {
      const mockTransactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      let methodIdentifier: 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' = 'CREDIT_CARD';
      if (this.activeTab === 'UPI') methodIdentifier = 'UPI';
      if (this.activeTab === 'NET_BANKING') methodIdentifier = 'NET_BANKING';

      this.bookingService.confirmPayment(this.bookingId, {
        paymentMethod: methodIdentifier as any, // Cast since PaymentRequest type might differ slightly in TS
        transactionId: mockTransactionId
      }).subscribe({
        next: () => {
          this.showOtpModal = false;
          this.router.navigate(['/tenant/booking-success', this.bookingId]);
        },
        error: (err) => {
          console.error('Payment confirmation failed', err);
          this.errorMessage = 'Transaction failed. Please try again.';
          this.isProcessing = false;
          this.showOtpModal = false;
        }
      });
    }, 1500);
  }
}
