import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService, RoomSearchCriteria } from '../../../core/services/room.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tenant-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rooms-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon text-primary" [innerHTML]="homeIcon"></div>
          <div>
            <h1 class="page-title">Find Your Room</h1>
            <p class="page-subtitle">Browse available rooms and choose the perfect fit for your stay</p>
          </div>
        </div>
        <div class="results-count" *ngIf="hasSearched && !isLoading">
          <span class="count-badge">{{ rooms.length }} room{{ rooms.length !== 1 ? 's' : '' }} found</span>
        </div>
      </div>

      <!-- Filter Panel -->
      <div class="filter-panel">
        <div class="filter-grid">

          <!-- Room Type -->
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon" [innerHTML]="bedIconSmall"></span> Room Type
            </label>
            <div class="type-buttons">
              <button
                *ngFor="let type of roomTypes"
                class="type-btn"
                [class.active]="searchFilters.roomType === type.value"
                (click)="selectRoomType(type.value)"
              >
                <span [innerHTML]="type.icon"></span> {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Price Range -->
          <div class="filter-group price-group">
            <label class="filter-label">
              <span class="label-icon" [innerHTML]="priceIcon"></span> Price Range (₹/month)
            </label>
            <div class="price-inputs">
              <div class="price-input-wrap">
                <span class="price-prefix">₹</span>
                <input
                  type="number"
                  [(ngModel)]="searchFilters.minPrice"
                  placeholder="Min"
                  class="price-input"
                  min="0"
                >
              </div>
              <span class="price-sep">—</span>
              <div class="price-input-wrap">
                <span class="price-prefix">₹</span>
                <input
                  type="number"
                  [(ngModel)]="searchFilters.maxPrice"
                  placeholder="Max"
                  class="price-input"
                  min="0"
                >
              </div>
            </div>
          </div>

          <!-- Sort + Search -->
          <div class="filter-group action-group">
            <label class="filter-label">
              <span class="label-icon" [innerHTML]="sortIcon"></span> Sort By
            </label>
            <div class="action-row">
              <select [(ngModel)]="searchFilters.sortOrder" class="sort-select">
                <option value="asc">Price: Low → High</option>
                <option value="desc">Price: High → Low</option>
              </select>
              <button class="search-btn flex items-center gap-2" (click)="handleSearch()" [disabled]="isLoading">
                <span *ngIf="!isLoading" class="flex items-center gap-2">
                  <span class="w-4 h-4" [innerHTML]="searchIcon"></span>
                  Search
                </span>
                <span *ngIf="isLoading" class="spinner-inline"></span>
              </button>
            </div>
          </div>

        </div>

        <!-- Active Filters Display -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <span class="filter-chip" *ngIf="searchFilters.roomType">
            {{ getRoomTypeLabel(searchFilters.roomType) }}
            <button (click)="clearRoomType()">×</button>
          </span>
          <span class="filter-chip" *ngIf="searchFilters.minPrice">
            Min ₹{{ searchFilters.minPrice }}
            <button (click)="searchFilters.minPrice = undefined">×</button>
          </span>
          <span class="filter-chip" *ngIf="searchFilters.maxPrice">
            Max ₹{{ searchFilters.maxPrice }}
            <button (click)="searchFilters.maxPrice = undefined">×</button>
          </span>
          <button class="clear-all-btn" (click)="clearAllFilters()">Clear All</button>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="errorMessage">
        <span class="error-icon" [innerHTML]="errorIcon"></span>
        <span>{{ errorMessage }}</span>
        <button class="retry-btn" (click)="fetchRooms()">Retry</button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && hasSearched && rooms.length === 0 && !errorMessage">
        <div class="empty-icon text-muted-foreground/30" [innerHTML]="searchIconLg"></div>
        <h3 class="empty-title">No Rooms Found</h3>
        <p class="empty-subtitle">Try adjusting your filters or clearing some criteria.</p>
        <button class="clear-all-btn" style="margin-top:1rem" (click)="clearAllFilters()">Show All Rooms</button>
      </div>

      <!-- Welcome State (before first search) -->
      <div class="welcome-state" *ngIf="!isLoading && !hasSearched && !errorMessage">
        <div class="welcome-icon text-primary/20" [innerHTML]="homeIconLg"></div>
        <h3 class="welcome-title">Discover Available Rooms</h3>
        <p class="welcome-subtitle">Click Search to browse all available rooms, or apply filters to narrow your choices.</p>
        <button class="search-btn-lg" (click)="handleSearch()">Browse All Rooms</button>
      </div>

      <!-- Room Grid -->
      <div class="rooms-grid" *ngIf="!isLoading && rooms.length > 0">
        <div
          class="room-card"
          *ngFor="let room of rooms"
          (click)="viewRoomDetails(room)"
        >
          <!-- Image -->
          <div class="card-image-wrap">
            <img
              [src]="getRoomImage(room)"
              [alt]="'Room ' + room.roomNumber"
              class="card-image"
              (error)="onImageError($event)"
            >
            <div class="card-badge" [class]="getRoomTypeBadgeClass(room.roomType)">
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
              <span class="floor-badge">Floor {{ room.floor }}</span>
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
                <span class="stat-value">{{ room.totalBeds }} bed{{ room.totalBeds !== 1 ? 's' : '' }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item" [class.stat-green]="room.availableBeds > 0">
                <span class="stat-icon" [innerHTML]="availableIconSmall"></span>
                <span class="stat-label">Available</span>
                <span class="stat-value">{{ room.availableBeds }} bed{{ room.availableBeds !== 1 ? 's' : '' }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-icon text-primary/60" [innerHTML]="sizeIcon"></span>
                <span class="stat-label">Size</span>
                <span class="stat-value">{{ room.roomSize }} sq ft</span>
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
      </div>

    </div>
  `,
  styles: [`
    /* ─── Page Layout ─────────────────────────────── */
    .rooms-page {
      padding: 0 0 3rem;
      min-height: 100vh;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    /* ─── Header ─────────────────────────────────── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-icon {
      font-size: 2.5rem;
      line-height: 1;
    }
    .page-title {
      font-size: 1.9rem;
      font-weight: 800;
      color: var(--foreground, #1a1a2e);
      margin: 0;
      letter-spacing: -0.5px;
    }
    .page-subtitle {
      color: var(--muted-foreground, #64748b);
      font-size: 0.9rem;
      margin: 0.25rem 0 0;
    }
    .results-count { display: flex; align-items: center; }
    .count-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 8px rgba(102,126,234,0.35);
    }

    /* ─── Filter Panel ───────────────────────────── */
    .filter-panel {
      background: var(--card, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .filter-grid {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1.5rem;
      align-items: end;
    }
    @media (max-width: 900px) {
      .filter-grid { grid-template-columns: 1fr; }
    }
    .filter-group { display: flex; flex-direction: column; gap: 0.6rem; }
    .filter-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--muted-foreground, #64748b);
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .label-icon { font-size: 0.9rem; }

    /* Type buttons */
    .type-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .type-btn {
      padding: 0.45rem 0.9rem;
      border-radius: 10px;
      border: 1.5px solid var(--border, #e2e8f0);
      background: transparent;
      color: var(--foreground, #374151);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .type-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }
    .type-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: transparent;
      color: white;
      box-shadow: 0 3px 10px rgba(102,126,234,0.35);
    }

    /* Price inputs */
    .price-inputs { display: flex; align-items: center; gap: 0.5rem; }
    .price-input-wrap {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 10px;
      overflow: hidden;
      background: var(--background, #fff);
      transition: border-color 0.18s;
    }
    .price-input-wrap:focus-within { border-color: #667eea; }
    .price-prefix {
      padding: 0 0.5rem;
      color: var(--muted-foreground, #94a3b8);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .price-input {
      width: 90px;
      height: 38px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.85rem;
      color: var(--foreground, #374151);
      padding-right: 0.5rem;
    }
    .price-sep { color: var(--muted-foreground, #94a3b8); font-weight: 600; }

    /* Sort + search */
    .action-group { min-width: 200px; }
    .action-row { display: flex; gap: 0.5rem; align-items: center; }
    .sort-select {
      height: 40px;
      padding: 0 0.75rem;
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 10px;
      background: var(--background, #fff);
      color: var(--foreground, #374151);
      font-size: 0.85rem;
      cursor: pointer;
      flex: 1;
    }
    .search-btn {
      height: 40px;
      padding: 0 1.2rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
      white-space: nowrap;
      box-shadow: 0 3px 10px rgba(102,126,234,0.35);
    }
    .search-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner-inline {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Active filter chips */
    .active-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border, #e2e8f0);
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: rgba(102,126,234,0.1);
      color: #667eea;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .filter-chip button {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
      margin-left: 0.1rem;
    }
    .clear-all-btn {
      background: none;
      border: 1.5px solid var(--border, #e2e8f0);
      color: var(--muted-foreground, #64748b);
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.18s;
    }
    .clear-all-btn:hover {
      border-color: #ef4444;
      color: #ef4444;
    }

    /* ─── States ─────────────────────────────────── */
    .error-state {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(239,68,68,0.08);
      color: #dc2626;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(239,68,68,0.2);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .retry-btn {
      margin-left: auto;
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.3rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .loading-state { margin-top: 1rem; }
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.5rem;
    }
    .skeleton-card {
      height: 380px;
      border-radius: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 400% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .empty-state, .welcome-state {
      text-align: center;
      padding: 5rem 1rem;
      color: var(--muted-foreground, #64748b);
    }
    .empty-icon, .welcome-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-title, .welcome-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--foreground, #1a1a2e);
      margin: 0 0 0.5rem;
    }
    .empty-subtitle, .welcome-subtitle { font-size: 0.9rem; margin: 0; }
    .search-btn-lg {
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102,126,234,0.4);
      transition: transform 0.18s;
    }
    .search-btn-lg:hover { transform: translateY(-2px); }

    /* ─── Room Grid ───────────────────────────────── */
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.5rem;
    }

    /* ─── Room Card ───────────────────────────────── */
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
export class TenantRoomsComponent implements OnInit {
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  searchFilters: any = {
    roomType: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'price',
    sortOrder: 'asc',
  };

  rooms: any[] = [];
  roomTypes: any[] = [];

  homeIcon!: SafeHtml;
  homeIconLg!: SafeHtml;
  bedIconSmall!: SafeHtml;
  priceIcon!: SafeHtml;
  sortIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  searchIconLg!: SafeHtml;
  errorIcon!: SafeHtml;
  availableIconSmall!: SafeHtml;
  sizeIcon!: SafeHtml;

  constructor(
    private roomService: RoomService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.initIcons();
  }

  private initIcons() {
    const icons = {
      home: '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      homeLg: '<svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      bed: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      price: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      sort: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>',
      search: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
      searchLg: '<svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
      error: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      available: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      size: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>',
      user: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      users: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
    };

    this.homeIcon = this.sanitizer.bypassSecurityTrustHtml(icons.home);
    this.homeIconLg = this.sanitizer.bypassSecurityTrustHtml(icons.homeLg);
    this.bedIconSmall = this.sanitizer.bypassSecurityTrustHtml(icons.bed);
    this.priceIcon = this.sanitizer.bypassSecurityTrustHtml(icons.price);
    this.sortIcon = this.sanitizer.bypassSecurityTrustHtml(icons.sort);
    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(icons.search);
    this.searchIconLg = this.sanitizer.bypassSecurityTrustHtml(icons.searchLg);
    this.errorIcon = this.sanitizer.bypassSecurityTrustHtml(icons.error);
    this.availableIconSmall = this.sanitizer.bypassSecurityTrustHtml(icons.available);
    this.sizeIcon = this.sanitizer.bypassSecurityTrustHtml(icons.size);

    this.roomTypes = [
      { value: '', label: 'All', icon: this.homeIcon },
      { value: 'SINGLE_SHARING', label: 'Single', icon: this.sanitizer.bypassSecurityTrustHtml(icons.user) },
      { value: 'DOUBLE_SHARING', label: 'Double', icon: this.sanitizer.bypassSecurityTrustHtml(icons.users) },
      { value: 'TRIPLE_SHARING', label: 'Triple', icon: this.sanitizer.bypassSecurityTrustHtml(icons.users) },
    ];
  }

  ngOnInit() {
    // Load all available rooms on initial page visit
    this.fetchRooms();
  }

  selectRoomType(value: string) {
    this.searchFilters.roomType = value;
  }

  clearRoomType() {
    this.searchFilters.roomType = '';
  }

  clearAllFilters() {
    this.searchFilters = {
      roomType: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'price',
      sortOrder: 'asc',
    };
    this.fetchRooms();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchFilters.roomType || this.searchFilters.minPrice || this.searchFilters.maxPrice);
  }

  handleSearch() {
    this.fetchRooms();
  }

  fetchRooms() {
    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    const criteria: RoomSearchCriteria = {
      moveInDate: '',
      roomType: this.searchFilters.roomType || '',
      minPrice: this.searchFilters.minPrice,
      maxPrice: this.searchFilters.maxPrice,
      sortBy: this.searchFilters.sortBy,
      sortOrder: this.searchFilters.sortOrder,
    };

    this.roomService.searchRooms(criteria).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.rooms = response.data.content || [];
        } else {
          this.rooms = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching rooms:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to search rooms. Please try again.';
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
    // Use the last digit of the room number for semi-random but consistent assignment
    const num = roomNumber.replace(/\D/g, '');
    const index = num ? parseInt(num.slice(-1)) % 5 : Math.floor(Math.random() * 5);
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

  getRoomTypeLabel(type: string): string {
    const t = this.roomTypes.find(r => r.value === type);
    return t ? t.label : type;
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
}
