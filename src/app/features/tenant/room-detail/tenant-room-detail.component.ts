import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tenant-room-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-page">

      <!-- Back Navigation -->
      <button class="back-btn" (click)="goBack()">
        ← Back to Search
      </button>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="skeleton-hero"></div>
        <div class="skeleton-info"></div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="errorMessage && !isLoading">
        <div class="error-icon" [innerHTML]="icons['error']"></div>
        <h3>Room Not Found</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn-back-err" (click)="goBack()">← Back to Rooms</button>
      </div>

      <!-- Room Details -->
      <div class="detail-layout" *ngIf="room && !isLoading">

        <!-- LEFT: Image Gallery -->
        <div class="gallery-section">
          <div class="main-image-wrap">
            <img
              [src]="selectedImage || getDefaultImage()"
              [alt]="'Room ' + room.roomNumber"
              class="main-image"
              (error)="onImageError($event)"
            >
            <div class="image-overlay">
              <span class="avail-badge" *ngIf="room.availableBeds > 0">
                <span class="dot-green"></span> Available
              </span>
              <span class="room-type-badge" [class]="getBadgeClass(room.roomType)">
                {{ formatRoomType(room.roomType) }}
              </span>
            </div>
          </div>

          <!-- Thumbnails -->
          <div class="thumbnails" *ngIf="room.images && room.images.length > 1">
            <div
              class="thumb-wrap"
              *ngFor="let img of room.images; let i = index"
              [class.active]="selectedImage === img"
              (click)="selectedImage = img"
            >
              <img [src]="img" [alt]="'Room image ' + (i+1)" class="thumb-img" (error)="onThumbError($event, i)">
            </div>
          </div>
        </div>

        <!-- RIGHT: Details Panel -->
        <div class="details-section">

          <!-- Header -->
          <div class="detail-header">
            <div class="room-id-row">
              <h1 class="room-title">Room {{ room.roomNumber }}</h1>
              <span class="floor-tag">Floor {{ room.floor }}</span>
            </div>
            <p class="room-size-text">{{ room.roomSize }} sq ft · {{ formatRoomType(room.roomType) }} Room</p>
          </div>

          <!-- Price Card -->
          <div class="price-card">
            <div class="price-left">
              <span class="price-label">Monthly Rent</span>
              <div class="price-display">
                <span class="currency">₹</span>
                <span class="amount">{{ room.price | number }}</span>
                <span class="period">/month</span>
              </div>
            </div>
            <div class="price-right">
              <div class="beds-display">
                <div class="beds-circles">
                  <div
                    *ngFor="let i of getBedArray(room.totalBeds)"
                    class="bed-dot"
                    [class.occupied]="i >= room.availableBeds"
                  ></div>
                </div>
                <div class="beds-text">
                  <span class="beds-avail">{{ room.availableBeds }}</span>
                  <span class="beds-total"> / {{ room.totalBeds }} beds available</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="description-card" *ngIf="room.description">
            <h3 class="section-title">About This Room</h3>
            <p class="description-text">{{ room.description }}</p>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrap blue" [innerHTML]="icons['bed']"></div>
              <div class="stat-info">
                <span class="stat-val">{{ room.totalBeds }}</span>
                <span class="stat-lbl">Total Beds</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap green" [innerHTML]="icons['check']"></div>
              <div class="stat-info">
                <span class="stat-val" style="color:#10b981">{{ room.availableBeds }}</span>
                <span class="stat-lbl">Available Beds</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap purple" [innerHTML]="icons['size']"></div>
              <div class="stat-info">
                <span class="stat-val">{{ room.roomSize }}</span>
                <span class="stat-lbl">Sq Ft</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap orange" [innerHTML]="icons['floor']"></div>
              <div class="stat-info">
                <span class="stat-val">{{ room.floor }}</span>
                <span class="stat-lbl">Floor</span>
              </div>
            </div>
          </div>

          <!-- Facilities / Amenities -->
          <div class="facilities-section" *ngIf="room.amenities && room.amenities.length > 0">
            <h3 class="section-title">Facilities & Amenities</h3>
            <div class="facilities-grid">
              <div
                class="facility-card"
                *ngFor="let amenity of room.amenities"
              >
                <span class="facility-icon" [innerHTML]="getAmenityIcon(amenity)"></span>
                <span class="facility-name">{{ amenity }}</span>
              </div>
            </div>
          </div>

          <!-- No Amenities State -->
          <div class="no-amenities" *ngIf="!room.amenities || room.amenities.length === 0">
            <p>No specific amenities listed for this room.</p>
          </div>

          <!-- Action Buttons -->
          <div class="action-section">
            <div class="action-note" *ngIf="room.availableBeds === 0">
              <span [innerHTML]="icons['warning']"></span> No beds currently available — check back soon!
            </div>
            <div class="action-buttons">
              <button class="btn-secondary" (click)="goBack()">← Back</button>
              <button
                class="btn-primary"
                [disabled]="room.availableBeds === 0"
                (click)="bookRoom()"
              >
                {{ room.availableBeds > 0 ? 'Book This Room' : 'No Beds Available' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Layout ──────────────────────────────────── */
    .detail-page {
      padding: 0 0 3rem;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: 1.5px solid var(--border, #e2e8f0);
      color: var(--muted-foreground, #64748b);
      padding: 0.45rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 1.75rem;
      transition: all 0.18s;
    }
    .back-btn:hover { border-color: #667eea; color: #667eea; }

    /* ─── Loading ─────────────────────────────────── */
    .loading-state { display: flex; flex-direction: column; gap: 1.5rem; }
    .skeleton-hero {
      height: 420px;
      border-radius: 18px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 400% 100%;
      animation: shimmer 1.4s infinite;
    }
    .skeleton-info {
      height: 200px;
      border-radius: 14px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 400% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ─── Error ───────────────────────────────────── */
    .error-state {
      text-align: center;
      padding: 5rem 1rem;
      color: var(--muted-foreground, #64748b);
    }
    .error-icon { font-size: 4rem; margin-bottom: 1rem; }
    .error-state h3 { font-size: 1.4rem; color: var(--foreground, #1a1a2e); margin: 0 0 0.5rem; }
    .btn-back-err {
      margin-top: 1rem;
      padding: 0.6rem 1.5rem;
      border-radius: 10px;
      background: var(--secondary, #f1f5f9);
      border: 1px solid var(--border, #e2e8f0);
      color: var(--foreground, #374151);
      cursor: pointer;
      font-weight: 600;
    }

    /* ─── Two-column Detail Layout ────────────────── */
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .detail-layout { grid-template-columns: 1fr; }
    }

    /* ─── Gallery ─────────────────────────────────── */
    .gallery-section { display: flex; flex-direction: column; gap: 0.75rem; }
    .main-image-wrap {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
      height: 360px;
      background: linear-gradient(135deg, #667eea15, #764ba215);
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }
    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .main-image-wrap:hover .main-image { transform: scale(1.03); }
    .image-overlay {
      position: absolute;
      top: 14px;
      left: 14px;
      display: flex;
      gap: 0.5rem;
    }
    .avail-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(0,0,0,0.55);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      backdrop-filter: blur(8px);
    }
    .dot-green {
      width: 7px; height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 6px #10b981;
    }
    .room-type-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      backdrop-filter: blur(8px);
    }
    .badge-single { background: rgba(99,102,241,0.8); color: white; }
    .badge-double { background: rgba(16,185,129,0.8); color: white; }
    .badge-triple { background: rgba(245,158,11,0.8); color: white; }

    .thumbnails {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .thumb-wrap {
      width: 72px; height: 54px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.18s;
    }
    .thumb-wrap.active { border-color: #667eea; }
    .thumb-wrap:hover { border-color: #764ba2; }
    .thumb-img { width: 100%; height: 100%; object-fit: cover; }

    /* ─── Details Panel ───────────────────────────── */
    .details-section { display: flex; flex-direction: column; gap: 1.2rem; }

    .detail-header { }
    .room-id-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
    .room-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--foreground, #1a1a2e);
      margin: 0;
      letter-spacing: -0.5px;
    }
    .floor-tag {
      background: var(--secondary, #f1f5f9);
      color: var(--muted-foreground, #64748b);
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .room-size-text {
      font-size: 0.9rem;
      color: var(--muted-foreground, #64748b);
      margin: 0;
    }

    /* Price card */
    .price-card {
      background: linear-gradient(135deg, #667eea08, #764ba210);
      border: 1.5px solid rgba(102,126,234,0.2);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .price-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #667eea;
      font-weight: 700;
      display: block;
      margin-bottom: 0.3rem;
    }
    .price-display { display: flex; align-items: baseline; gap: 0.2rem; }
    .currency {
      font-size: 1.4rem;
      font-weight: 700;
      color: #667eea;
    }
    .amount {
      font-size: 2.2rem;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
    .period {
      font-size: 0.82rem;
      color: var(--muted-foreground, #64748b);
    }
    .beds-display { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
    .beds-circles { display: flex; gap: 0.4rem; }
    .bed-dot {
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px rgba(16,185,129,0.5);
      transition: background 0.2s;
    }
    .bed-dot.occupied {
      background: #e2e8f0;
      box-shadow: none;
    }
    .beds-text { font-size: 0.78rem; color: var(--muted-foreground, #64748b); }
    .beds-avail { font-weight: 800; color: #10b981; font-size: 0.9rem; }
    .beds-total { }

    /* Description */
    .description-card {
      background: var(--card, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem 1.3rem;
    }
    .section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--muted-foreground, #64748b);
      margin: 0 0 0.6rem;
    }
    .description-text {
      font-size: 0.9rem;
      color: var(--foreground, #374151);
      line-height: 1.65;
      margin: 0;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card {
      background: var(--card, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      text-align: center;
      transition: box-shadow 0.18s;
    }
    .stat-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .stat-icon-wrap {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .stat-icon-wrap.blue { background: rgba(99,102,241,0.1); }
    .stat-icon-wrap.green { background: rgba(16,185,129,0.1); }
    .stat-icon-wrap.purple { background: rgba(139,92,246,0.1); }
    .stat-icon-wrap.orange { background: rgba(245,158,11,0.1); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--foreground, #1a1a2e);
    }
    .stat-lbl {
      font-size: 0.68rem;
      color: var(--muted-foreground, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Facilities */
    .facilities-section {
      background: var(--card, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem 1.3rem;
    }
    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }
    .facility-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 0.5rem;
      background: var(--secondary, #f8fafc);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 12px;
      text-align: center;
      transition: all 0.18s;
    }
    .facility-card:hover {
      border-color: #667eea;
      background: rgba(102,126,234,0.05);
      transform: translateY(-2px);
    }
    .facility-icon { font-size: 1.5rem; }
    .facility-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--foreground, #374151);
      line-height: 1.3;
    }
    .no-amenities {
      font-size: 0.85rem;
      color: var(--muted-foreground, #94a3b8);
      font-style: italic;
    }

    /* Actions */
    .action-section { margin-top: 0.5rem; }
    .action-note {
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.3);
      color: #b45309;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .action-buttons { display: flex; gap: 0.75rem; }
    .btn-secondary {
      flex: 1;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1.5px solid var(--border, #e2e8f0);
      background: transparent;
      color: var(--foreground, #374151);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s;
    }
    .btn-secondary:hover { border-color: #667eea; color: #667eea; }
    .btn-primary {
      flex: 2;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
      box-shadow: 0 4px 15px rgba(102,126,234,0.35);
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:disabled {
      background: var(--secondary, #e2e8f0);
      color: var(--muted-foreground, #94a3b8);
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class TenantRoomDetailComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  room: any = null;
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private sanitizer: DomSanitizer
  ) { }

  icons: { [key: string]: SafeHtml } = {
    bed: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'),
    check: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'),
    size: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4-4l-5 5"/></svg>'),
    floor: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>'),
    warning: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'),
    error: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>')
  };

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    if (roomId) {
      this.loadRoomDetails(roomId);
    } else {
      this.errorMessage = 'Invalid room ID.';
      this.isLoading = false;
    }
  }

  loadRoomDetails(roomId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.getRoomDetails(roomId).subscribe({
      next: (response: any) => {
        this.room = response.data;
        if (this.room?.images?.length > 0) {
          this.selectedImage = this.room.images[0];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading room details:', error);
        this.errorMessage = error.error?.message || 'Failed to load room details.';
        this.isLoading = false;
      }
    });
  }

  bookRoom() {
    this.router.navigate(['/tenant/book', this.room.roomId]);
  }

  goBack() {
    this.router.navigate(['/tenant/rooms']);
  }

  getDefaultImage(): string {
    if (!this.room) return 'assets/room1.png';
    const images = ['room1.png', 'room2.png', 'room3.png', 'room4.png', 'room5.png'];
    const num = (this.room.roomNumber || '').replace(/\D/g, '');
    const index = num ? parseInt(num.slice(-1)) % 5 : Math.floor(Math.random() * 5);
    return `assets/${images[index]}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultImage();
  }

  onThumbError(event: Event, index: number) {
    const img = event.target as HTMLImageElement;
    img.src = `assets/room${(index % 5) + 1}.png`;
  }

  formatRoomType(type: string): string {
    const map: { [k: string]: string } = {
      'SINGLE_SHARING': 'Single Sharing',
      'DOUBLE_SHARING': 'Double Sharing',
      'TRIPLE_SHARING': 'Triple Sharing',
    };
    return map[type] || type;
  }

  getBadgeClass(type: string): string {
    const map: { [k: string]: string } = {
      'SINGLE_SHARING': 'room-type-badge badge-single',
      'DOUBLE_SHARING': 'room-type-badge badge-double',
      'TRIPLE_SHARING': 'room-type-badge badge-triple',
    };
    return map[type] || 'room-type-badge badge-single';
  }

  getBedArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i);
  }

  getAmenityIcon(amenity: string): SafeHtml {
    const icons: { [k: string]: string } = {
      'wifi': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
      'tv': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2m10 2V2M5 8h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2z"/></svg>',
      'television': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2m10 2V2M5 8h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2z"/></svg>',
      'air conditioning': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-1.432.716a2 2 0 01-1.55.132l-2.397-.57a2 2 0 00-1.051.046l-1.284.43M12 3v1m0 16v1M3 12h1m16 0h1M5.636 5.636l.707.707m11.314 11.314l.707.707M3 5.636l.707-.707m11.314 11.314l.707-.707"/></svg>',
      'ac': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-1.432.716a2 2 0 01-1.55.132l-2.397-.57a2 2 0 00-1.051.046l-1.284.43M12 3v1m0 16v1M3 12h1m16 0h1M5.636 5.636l.707.707m11.314 11.314l.707.707M3 5.636l.707-.707m11.314 11.314l.707-.707"/></svg>',
      'food': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6zM3 20h18"/></svg>',
      'meals': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6zM3 20h18"/></svg>',
      'laundry': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      'parking': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 6H4l-1 6h16l-2-6h-4z"/></svg>',
      'gym': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h2m0-2v4m14-4v4m2-2h-2m-5-4v12m-4-6h4"/></svg>',
      'cctv': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
      'security': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
      'hot water': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      'power backup': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
      'cleaning': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
      'lift': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>',
    };
    const lower = amenity.toLowerCase();
    for (const key of Object.keys(icons)) {
      if (lower.includes(key)) return this.sanitizer.bypassSecurityTrustHtml(icons[key]);
    }
    return this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>');
  }
}
