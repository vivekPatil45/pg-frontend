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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
              <div class="room-card" (click)="viewRoomDetails(room)">
                <!-- Image -->
                <div class="card-image-wrap">
                  <img
                    [src]="getRoomImage(room)"
                    [alt]="'Room ' + room.roomNumber"
                    class="card-image"
                    (error)="onImageError($event)"
                  >
                  <div [class]="getRoomTypeBadgeClass(room.roomType)">
                    {{ formatRoomType(room.roomType) }}
                  </div>
                  <div class="available-overlay">
                    <span class="dot-available"></span> Available
                  </div>
                </div>

                <!-- Card Body -->
                <div class="card-body">
                  <!-- Room Number & Floor -->
                  <div class="card-meta-row">
                    <span class="room-number">Room {{ room.roomNumber }}</span>
                    <span class="floor-badge">Floor {{ room.floor || 1 }}</span>
                  </div>

                  <!-- Price -->
                  <div class="price-row">
                    <span class="price-amount">₹{{ room.price | number }}</span>
                    <span class="price-period">/month</span>
                  </div>

                  <!-- Stats Row -->
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-icon text-primary/60" [innerHTML]="bedIconSmall"></span>
                      <span class="stat-label">Capacity</span>
                      <span class="stat-value">{{ room.totalBeds || (room.roomType === 'SINGLE_SHARING' ? 1 : room.roomType === 'DOUBLE_SHARING' ? 2 : 3) }} bed{{ room.totalBeds !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item stat-green">
                      <span class="stat-icon" [innerHTML]="availableIconSmall"></span>
                      <span class="stat-label">Available</span>
                      <span class="stat-value">{{ room.availableBeds || 1 }} bed{{ room.availableBeds !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-icon text-primary/60" [innerHTML]="sizeIcon"></span>
                      <span class="stat-label">Size</span>
                      <span class="stat-value">{{ room.roomSize || 180 }} sq ft</span>
                    </div>
                  </div>

                  <!-- Amenities -->
                  <div class="amenities-row" *ngIf="room.amenities && room.amenities.length > 0">
                    <span
                      class="amenity-tag flex items-center gap-1"
                      *ngFor="let a of room.amenities.slice(0, 3)"
                    >
                      <span class="w-3 h-3" [innerHTML]="getAmenityIcon(a)"></span>
                      {{ a }}
                    </span>
                    <span class="amenity-more" *ngIf="room.amenities.length > 3">
                      +{{ room.amenities.length - 3 }} more
                    </span>
                  </div>

                  <!-- Description -->
                  <p class="card-desc" *ngIf="room.description">{{ room.description }}</p>

                  <!-- Actions -->
                  <div class="card-actions">
                    <button class="btn-details" (click)="viewRoomDetails(room); $event.stopPropagation()">
                      View Details
                    </button>
                    <button class="btn-book" (click)="bookRoom(room); $event.stopPropagation()">
                      Book Now →
                    </button>
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

    /* ─── Room Card (Consistent with Search Page) ─── */
    .room-card {
      background: var(--card, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      cursor: pointer;
    }
    .room-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.12);
    }

    .card-image-wrap {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea20, #764ba220);
    }
    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .room-card:hover .card-image { transform: scale(1.06); }
    .card-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }
    .badge-single {
      background: rgba(99,102,241,0.85);
      color: white;
    }
    .badge-double {
      background: rgba(16,185,129,0.85);
      color: white;
    }
    .badge-triple {
      background: rgba(245,158,11,0.85);
      color: white;
    }
    .available-overlay {
      position: absolute;
      bottom: 10px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(0,0,0,0.5);
      color: white;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      backdrop-filter: blur(6px);
    }
    .dot-available {
      width: 7px; height: 7px;
      background: #10b981;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 6px #10b981;
    }

    .card-body { padding: 1.25rem; }
    .card-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .room-number {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--foreground, #1a1a2e);
    }
    .floor-badge {
      font-size: 0.72rem;
      color: var(--muted-foreground, #64748b);
      background: var(--secondary, #f1f5f9);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }
    .price-amount {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .price-period {
      font-size: 0.8rem;
      color: var(--muted-foreground, #64748b);
    }

    .stats-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--secondary, #f8fafc);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
      margin-bottom: 0.9rem;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: 0.1rem;
    }
    .stat-item.stat-green .stat-value { color: #10b981; font-weight: 700; }
    .stat-icon { font-size: 0.9rem; }
    .stat-label {
      font-size: 0.65rem;
      color: var(--muted-foreground, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--foreground, #374151);
    }
    .stat-divider {
      width: 1px;
      height: 28px;
      background: var(--border, #e2e8f0);
    }

    .amenities-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }
    .amenity-tag {
      font-size: 0.72rem;
      background: rgba(102,126,234,0.08);
      color: #667eea;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      border: 1px solid rgba(102,126,234,0.2);
      font-weight: 500;
    }
    .amenity-more {
      font-size: 0.72rem;
      color: var(--muted-foreground, #94a3b8);
      align-self: center;
    }

    .card-desc {
      font-size: 0.78rem;
      color: var(--muted-foreground, #64748b);
      margin: 0 0 1rem;
      line-height: 1.5;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .card-actions {
      display: flex;
      gap: 0.6rem;
    }
    .btn-details {
      flex: 1;
      padding: 0.55rem 0;
      border-radius: 10px;
      border: 1.5px solid var(--border, #e2e8f0);
      background: transparent;
      color: var(--foreground, #374151);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s;
    }
    .btn-details:hover {
      border-color: #667eea;
      color: #667eea;
    }
    .btn-book {
      flex: 1;
      padding: 0.55rem 0;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
      box-shadow: 0 3px 10px rgba(102,126,234,0.3);
    }
    .btn-book:hover { opacity: 0.9; transform: translateY(-1px); }
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

  bedIconSmall!: SafeHtml;
  availableIconSmall!: SafeHtml;
  sizeIcon!: SafeHtml;

  searchCriteria = {
    moveInDate: '',
    roomType: ''
  };

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private tenantService: TenantService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.initIcons();
  }

  private initIcons() {
    const icons = {
      bed: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      available: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      size: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>',
      wifi: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
      food: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/></svg>',
      ac: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
    };

    this.bedIconSmall = this.sanitizer.bypassSecurityTrustHtml(icons.bed);
    this.availableIconSmall = this.sanitizer.bypassSecurityTrustHtml(icons.available);
    this.sizeIcon = this.sanitizer.bypassSecurityTrustHtml(icons.size);
  }

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
    // Just get any top 3 available rooms
    const criteria = {
      moveInDate: this.minDate,
      roomType: ''
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

  viewRoomDetails(room: any) {
    this.router.navigate(['/tenant/rooms', room.roomId]);
  }

  bookRoom(room: any) {
    this.router.navigate(['/tenant/book', room.roomId]);
  }

  getRoomImage(room: any): string {
    if (room.images && room.images.length > 0) {
      return room.images[0];
    }
    return this.getPlaceholderImage(room.roomNumber);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/room1.png';
  }

  getPlaceholderImage(roomNumber: string): string {
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    const num = (roomNumber || '').replace(/\D/g, '');
    const index = num ? parseInt(num.slice(-1)) % images.length : Math.floor(Math.random() * images.length);
    return `assets/${images[index]}`;
  }

  formatRoomType(type: string): string {
    const map: { [k: string]: string } = {
      'SINGLE_SHARING': 'Single',
      'DOUBLE_SHARING': 'Double',
      'TRIPLE_SHARING': 'Triple',
    };
    return map[type] || type;
  }

  getRoomTypeBadgeClass(type: string): string {
    const map: { [k: string]: string } = {
      'SINGLE_SHARING': 'card-badge badge-single',
      'DOUBLE_SHARING': 'card-badge badge-double',
      'TRIPLE_SHARING': 'card-badge badge-triple',
    };
    return map[type] || 'card-badge badge-single';
  }

  getAmenityIcon(amenity: string): SafeHtml {
    const icons: { [key: string]: string } = {
      'WiFi': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
      'Food': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/></svg>',
      'Laundry': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
      'AC': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
      'TV': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2M17 4V2M5 8h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"/></svg>',
      'Cleaning': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
      'Parking': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>',
    };

    const defaultIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

    const iconStr = icons[amenity] || Object.entries(icons).find(([k]) => amenity.toLowerCase().includes(k.toLowerCase()))?.[1] || defaultIcon;

    return this.sanitizer.bypassSecurityTrustHtml(iconStr);
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
