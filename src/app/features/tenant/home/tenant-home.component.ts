import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../../core/services/auth.service';
import { RoomService } from '../../../core/services/room.service';
import { TenantService } from '../../../core/services/tenant.service';
import { Room } from '../../../models/room.model';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-tenant-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="space-y-8 animate-fade-in relative">
      <!-- Welcome Section -->
      <section class="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
        <div class="max-w-4xl mx-auto text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {{ (currentUser$ | async)?.name || 'Guest' }}!
          </h1>
          <p class="text-primary-foreground/80 text-lg">
            {{ activeBooking ? 'Your stay overview at SilverPG' : 'Find your perfect stay with us' }}
          </p>
        </div>

        @if (activeBooking) {
          <!-- Active Stay Overview -->
          <div class="bg-card text-card-foreground rounded-xl p-6 shadow-lg max-w-4xl mx-auto border border-border">
            <div class="flex flex-col md:flex-row justify-between gap-6">
              <div class="flex-1 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Room {{ activeBooking.room?.roomNumber }}</h3>
                    <p class="text-sm text-muted-foreground">{{ activeBooking.room?.roomType }} Sharing</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-muted-foreground uppercase font-semibold">Move In</p>
                    <p class="text-sm font-medium">{{ activeBooking.moveInDate | date:'mediumDate' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                    <app-status-badge [status]="activeBooking.status"></app-status-badge>
                  </div>
                </div>
              </div>

              <div class="w-px bg-border hidden md:block"></div>

              <div class="flex-1 flex flex-col justify-between gap-4">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-xs text-muted-foreground uppercase font-semibold">Monthly Rent</p>
                    <p class="text-2xl font-bold text-foreground">₹{{ activeBooking.room?.price }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-muted-foreground uppercase font-semibold">Payment Status</p>
                    <span [class]="activeBooking.paymentStatus === 'PAID' ? 'text-success' : 'text-amber-500'" class="text-sm font-bold">
                      {{ activeBooking.paymentStatus }}
                    </span>
                  </div>
                </div>
                
                <div class="flex gap-3">
                  <app-button variant="outline" size="sm" class="flex-1" routerLink="/tenant/complaints">Raise Complaint</app-button>
                  <app-button size="sm" class="flex-1" [routerLink]="['/tenant/payment', activeBooking.bookingId]">Pay Rent</app-button>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- Search Form -->
          <div class="bg-card text-card-foreground rounded-xl p-6 shadow-lg max-w-5xl mx-auto">
            <form (ngSubmit)="onSearch()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Move-in Date -->
                <div class="space-y-2">
                  <label class="text-sm font-medium">Move-in Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="searchCriteria.moveInDate" 
                    name="moveIn"
                    [min]="minDate"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    required
                  >
                </div>

                <!-- Room Type -->
                <div class="space-y-2">
                  <label class="text-sm font-medium">Room Type</label>
                  <select 
                    [(ngModel)]="searchCriteria.roomType" 
                    name="roomType"
                    class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    required
                  >
                    <option value="" disabled selected>Select Type</option>
                    <option value="SINGLE_SHARING">Single Sharing</option>
                    <option value="DOUBLE_SHARING">Double Sharing</option>
                    <option value="TRIPLE_SHARING">Triple Sharing</option>
                  </select>
                </div>

                <!-- Search Button -->
                <div class="flex items-end">
                  <app-button 
                    type="submit" 
                    class="w-full"
                    [disabled]="!isValidSearch()"
                  >
                    Search Rooms
                  </app-button>
                </div>
              </div>

              @if (errorMessage) {
                <div class="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded">
                  {{ errorMessage }}
                </div>
              }
            </form>
          </div>
        }
      </section>

      <!-- Quick Stats -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-card rounded-xl border border-border p-4 text-center">
          <svg class="h-8 w-8 mx-auto mb-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-2xl font-bold text-foreground">24/7</p>
          <p class="text-sm text-muted-foreground">Booking Available</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-4 text-center">
          <svg class="h-8 w-8 mx-auto mb-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-2xl font-bold text-foreground">Instant</p>
          <p class="text-sm text-muted-foreground">Confirmation</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-4 text-center">
          <svg class="h-8 w-8 mx-auto mb-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p class="text-2xl font-bold text-foreground">Secure</p>
          <p class="text-sm text-muted-foreground">Payment</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-4 text-center">
          <svg class="h-8 w-8 mx-auto mb-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p class="text-2xl font-bold text-foreground">5-Star</p>
          <p class="text-sm text-muted-foreground">Service</p>
        </div>
      </section>

      <!-- Featured Rooms -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-foreground">Featured Rooms</h2>
            <p class="text-muted-foreground">Discover our most popular accommodations</p>
          </div>
          <a routerLink="/tenant/rooms">
            <app-button variant="ghost" className="gap-2">
              View All
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </app-button>
          </a>
        </div>

        @if (isLoading) {
          <div class="flex justify-center py-12">
            <app-loading-spinner size="lg" text="Loading rooms..."></app-loading-spinner>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (room of featuredRooms; track room.roomId) {
              <div class="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer" (click)="viewRoom(room)">
                <!-- Room Image -->
                <div class="h-48 bg-muted overflow-hidden">
                  @if (room.images && room.images.length > 0) {
                    <img [src]="room.images[0]" alt="Room Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  } @else {
                    <img [src]="getRandomRoomImage(room.roomNumber)" alt="Featured Room" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  }
                </div>

                <!-- Room Details -->
                <div class="p-6">
                  <!-- Header: Type & Status -->
                  <div class="flex justify-between items-center mb-1">
                    <h3 class="text-lg font-bold text-foreground">{{ room.roomType }} Room</h3>
                    <div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      AVAILABLE
                    </div>
                  </div>

                  <!-- Sub-info -->
                  <p class="text-xs text-muted-foreground mb-3">
                    Room {{ room.roomNumber }}
                  </p>

                  <!-- Description -->
                  <p class="text-sm text-foreground/80 mb-4 line-clamp-2 min-h-[40px]">
                    {{ room.description }}
                  </p>

                  <!-- Amenities -->
                  <div class="flex flex-wrap gap-2 mb-6">
                    @for (amenity of room.amenities.slice(0, 3); track amenity) {
                      <span class="inline-flex items-center text-[10px] bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded border border-border/50">
                        {{ amenity }}
                      </span>
                    }
                  </div>

                  <!-- Divider -->
                  <div class="h-px bg-border/60 mb-6"></div>

                  <!-- Price & Action -->
                  <div class="flex justify-between items-center">
                    <div class="flex items-baseline">
                      <span class="text-xl font-bold text-foreground">₹{{ room.price }}</span>
                      <span class="text-xs text-muted-foreground ml-1">/month</span>
                    </div>
                    <app-button size="sm" class="rounded-lg font-bold px-4 py-1.5 h-auto">
                      Book Now
                    </app-button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Why Choose Us -->
      <section class="bg-muted rounded-2xl p-8">
        <h2 class="text-2xl font-bold text-foreground text-center mb-8">
          Why Choose SilverPG?
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Features -->
          <div class="text-center">
            <div class="h-12 w-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h3 class="font-semibold text-foreground mb-2">High-Speed WiFi</h3>
            <p class="text-sm text-muted-foreground">
              Stay connected with complimentary high-speed internet throughout the property.
            </p>
          </div>
            <div class="text-center">
            <div class="h-12 w-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Homely Meals</h3>
            <p class="text-sm text-muted-foreground">
              Enjoy wholesome and nutritious daily meals prepared with care.
            </p>
          </div>
          <div class="text-center">
            <div class="h-12 w-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-foreground mb-2">24/7 Support</h3>
            <p class="text-sm text-muted-foreground">
              Our dedicated team is available around the clock for your needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TenantHomeComponent implements OnInit {
  isLoading = false;
  currentUser$ = this.authService.currentUser$;
  minDate = new Date().toISOString().split('T')[0];
  errorMessage = '';
  featuredRooms: Room[] = [];
  activeBooking: Booking | null = null;
  isLoadingActiveStay = false;

  searchCriteria = {
    moveInDate: '',
    roomType: ''
  };

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private tenantService: TenantService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadFeaturedRooms();
    this.loadActiveStay();
  }

  loadActiveStay() {
    this.isLoadingActiveStay = true;
    this.tenantService.getActiveStay().subscribe({
      next: (res) => {
        this.activeBooking = res.data;
        this.isLoadingActiveStay = false;
      },
      error: () => {
        this.isLoadingActiveStay = false;
      }
    });
  }

  loadFeaturedRooms() {
    this.isLoading = true;
    // Empty criteria to just get latest available rooms
    const criteria = {
      moveInDate: this.minDate,
      roomType: 'SINGLE_SHARING' // Default search to show something
    };

    this.roomService.searchRooms(criteria, 0, 3).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.featuredRooms = response.data.content || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured rooms:', error);
        this.isLoading = false;
      }
    });
  }

  validateDates() {
    this.errorMessage = '';
    return true;
  }

  isValidSearch(): boolean {
    return !!(
      this.searchCriteria.moveInDate &&
      this.searchCriteria.roomType
    );
  }

  onSearch() {
    if (this.isValidSearch()) {
      this.router.navigate(['/tenant/rooms'], {
        queryParams: {
          moveInDate: this.searchCriteria.moveInDate,
          type: this.searchCriteria.roomType
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  viewRoom(room: Room) {
    this.router.navigate(['/tenant/rooms'], {
      queryParams: {
        type: room.roomType,
        moveInDate: this.minDate
      }
    });
  }

  getRandomRoomImage(roomNumber: string): string {
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    const num = (roomNumber || '').replace(/\D/g, '');
    const index = num ? parseInt(num.slice(-1)) % images.length : Math.floor(Math.random() * images.length);
    return `assets/${images[index]}`;
  }
}
