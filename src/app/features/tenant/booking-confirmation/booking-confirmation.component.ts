import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { BookingService } from '../../../core/services/booking.service';
import { CreateBookingData } from '../../../models/booking.model';
import { AuthService } from '../../../core/services/auth.service';
import { Room } from '../../../models/room.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <h1 class="text-3xl font-bold text-foreground">Confirm Your Booking</h1>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (room) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Left Column: Room & Booking Details -->
          <div class="md:col-span-2 space-y-6">
            <!-- Room Info -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Room Details</h2>
              <div class="flex flex-col md:flex-row gap-4">
                @if (room.images && room.images.length > 0) {
                  <img [src]="room.images[0]" alt="Room" class="w-full md:w-48 h-32 object-cover rounded-md">
                } @else {
                  <img [src]="getRandomRoomImage(room.roomNumber)" alt="Room" class="w-full md:w-48 h-32 object-cover rounded-md">
                }
                <div>
                  <h3 class="font-medium text-lg text-primary">{{ room.roomType }} Room</h3>
                  <p class="text-sm text-muted-foreground">Room {{ room.roomNumber }}</p>
                  <p class="text-sm text-foreground mt-2">{{ room.description }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (amenity of room.amenities; track amenity) {
                      <span class="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{{ amenity }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Tenant Details -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Guest Details</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div class="space-y-1">
                  <p class="text-muted-foreground">Name</p>
                  <p class="font-medium text-foreground text-base">{{ user?.name || 'N/A' }}</p>
                </div>
                <div class="space-y-1 overflow-hidden">
                  <p class="text-muted-foreground">Email</p>
                  <p class="font-medium text-foreground text-base truncate" [title]="user?.email || ''">{{ user?.email || 'N/A' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-muted-foreground">Phone</p>
                  <p class="font-medium text-foreground text-base">{{ user?.phone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Choose Bed -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-foreground">Choose Your Bed</h2>
                @if (isLoadingBeds) {
                  <app-loading-spinner size="sm"></app-loading-spinner>
                }
              </div>
              
              @if (!isLoadingBeds && availableBeds.length === 0) {
                <div class="text-center py-6 bg-destructive/10 text-destructive rounded-lg">
                  <p class="font-medium">No beds currently available in this room.</p>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  @for (bed of availableBeds; track bed.bedId) {
                    <div 
                      class="border-2 rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                      [ngClass]="{
                        'border-primary bg-primary text-primary-foreground': selectedBedId === bed.bedId,
                        'border-border hover:border-primary/50': selectedBedId !== bed.bedId
                      }"
                      (click)="selectedBedId = bed.bedId"
                    >
                      <svg class="w-8 h-8 mx-auto mb-2" [class.text-primary-foreground]="selectedBedId === bed.bedId" [class.text-muted-foreground]="selectedBedId !== bed.bedId" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      <p class="font-bold">Bed {{ bed.bedNumber }}</p>
                      <p class="text-xs mt-1 opacity-80 pb-1 border-b border-current inline-block">{{ bed.status }}</p>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Special Requests -->
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Special Requests</h2>
              <textarea 
                [(ngModel)]="specialRequests" 
                class="w-full h-24 p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary"
                placeholder="Any special requests? (e.g. Late check-in, Extra bed...)"
              ></textarea>
            </div>
          </div>

          <!-- Right Column: Price Summary -->
          <div class="md:col-span-1">
            <div class="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <h2 class="text-xl font-semibold mb-4 text-foreground">Price Summary</h2>
              
              <div class="space-y-3 text-sm border-b border-border pb-4 mb-4">
                <div class="space-y-2">
                  <label class="text-muted-foreground block">Move-in Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="moveInDate" 
                    [min]="minDate"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
                  >
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Monthly Rent</span>
                  <span class="text-foreground">₹{{ basePrice }}</span>
                </div>
                 <div class="flex justify-between">
                  <span class="text-muted-foreground">Taxes (12%)</span>
                  <span class="text-foreground">₹{{ taxAmount }}</span>
                </div>
                <div class="flex justify-between pt-4 border-t border-border">
                  <span class="text-lg font-bold text-foreground">Total</span>
                  <span class="text-lg font-bold text-primary">₹{{ totalAmount }}</span>
                </div>
              </div>

              <app-button 
                [className]="'w-full mt-6'" 
                (click)="proceedToPayment()"
                [disabled]="isProcessing || !selectedBedId || isLoadingBeds || availableBeds.length === 0"
              >
                @if (isProcessing) {
                  Processing...
                } @else if (!selectedBedId) {
                  Select a Bed
                } @else {
                  Pay Booking Amount
                }
              </app-button>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-destructive">
          <p>Error loading room details. Please try again.</p>
          <app-button (click)="goBack()" variant="outline" class="mt-4">Go Back</app-button>
        </div>
      }
    </div>
  `
})
export class BookingConfirmationComponent implements OnInit {
  room: Room | null = null;
  user: any = null;
  isLoading = true;
  isProcessing = false;

  // Booking Params
  roomId: string = '';
  moveInDate: string = '';
  minDate: string = new Date().toISOString().split('T')[0];
  specialRequests: string = '';

  // Bed Selection
  availableBeds: any[] = [];
  selectedBedId: string = '';
  isLoadingBeds: boolean = true;

  // Calculations
  basePrice: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    console.log('Booking Confirmation - User:', this.user);


    this.route.params.subscribe(params => {
      this.roomId = params['roomId'];
      if (this.roomId) {
        this.fetchRoomDetails(this.roomId);
        this.fetchAvailableBeds(this.roomId);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.moveInDate = params['moveInDate'] || new Date().toISOString().split('T')[0];
    });
  }

  fetchRoomDetails(id: string) {
    this.isLoading = true;
    this.roomService.getRoomById(id).subscribe({
      next: (response) => {
        this.room = response.data;
        this.calculatePrice();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching room', err);
        this.isLoading = false;
      }
    });
  }

  fetchAvailableBeds(roomId: string) {
    this.isLoadingBeds = true;
    this.roomService.getAvailableBeds(roomId).subscribe({
      next: (response) => {
        this.availableBeds = response.data || [];
        this.isLoadingBeds = false;
        if (this.availableBeds.length > 0) {
          this.selectedBedId = this.availableBeds[0].bedId; // Auto-select first available bed
        }
      },
      error: (err) => {
        console.error('Error fetching available beds', err);
        this.toastService.error('Could not load available beds.');
        this.isLoadingBeds = false;
      }
    });
  }

  calculatePrice() {
    if (!this.room) return;

    // Booking amount is usually just 1 month's rent in this domain as the initial payment
    this.basePrice = this.room.price;
    this.taxAmount = 0; // Simplified for PG domain
    this.totalAmount = this.basePrice;
  }

  proceedToPayment() {
    if (!this.roomId || !this.selectedBedId) {
      this.toastService.error('Please select a bed to continue.');
      return;
    }

    this.isProcessing = true;
    const request: CreateBookingData = {
      roomId: this.roomId,
      bedId: this.selectedBedId,
      moveInDate: this.moveInDate,
    };

    this.bookingService.createBooking(request).subscribe({
      next: (response) => {
        const bookingId = response.data.bookingId;
        this.router.navigate(['/tenant/payment', bookingId]);
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.toastService.error(err.error?.message || 'Failed to initiate booking. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/tenant/rooms']);
  }

  getRandomRoomImage(roomNumber: string): string {
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    const num = (roomNumber || '').replace(/\D/g, '');
    const index = num ? parseInt(num.slice(-1)) % images.length : Math.floor(Math.random() * images.length);
    return `assets/${images[index]}`;
  }
}
