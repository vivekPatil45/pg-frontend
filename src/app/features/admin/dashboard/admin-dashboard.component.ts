import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsCardComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Welcome Header -->
      <div>
        <h1 class="text-3xl font-bold text-foreground">Welcome, {{ adminName }}!</h1>
        <p class="text-muted-foreground mt-1">Overview of your PG — rooms, tenants, and bookings at a glance.</p>
      </div>

      <!-- Loading -->
      @if (isLoading) {
        <div class="flex justify-center items-center py-16">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <app-stats-card
            title="Total Rooms"
            [value]="stats?.totalRooms ?? '—'"
            [icon]="roomIcon"
            description="Registered rooms"
          ></app-stats-card>
          <app-stats-card
            title="Occupied Beds"
            [value]="stats?.occupiedBeds ?? '—'"
            [icon]="occupiedIcon"
            description="Currently occupied"
          ></app-stats-card>
          <app-stats-card
            title="Available Beds"
            [value]="stats?.availableBeds ?? '—'"
            [icon]="availableIcon"
            description="Ready to book"
          ></app-stats-card>
          <app-stats-card
            title="Pending Bookings"
            [value]="stats?.pendingBookings ?? '—'"
            [icon]="pendingIcon"
            description="Awaiting approval"
          ></app-stats-card>
          <app-stats-card
            title="Total Tenants"
            [value]="stats?.totalTenants ?? '—'"
            [icon]="tenantsIcon"
            description="Active tenants"
          ></app-stats-card>
          <app-stats-card
            title="Monthly Revenue"
            [value]="stats?.monthlyRevenue ? ('₹' + stats.monthlyRevenue) : '—'"
            [icon]="revenueIcon"
            description="This month"
          ></app-stats-card>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Room Status -->
          <div class="bg-card rounded-xl border border-border p-6">
            <h3 class="font-semibold text-lg mb-4 text-foreground">Room Occupancy</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-success"></div>
                  <span class="text-sm font-medium text-foreground">Available Beds</span>
                </div>
                <span class="text-sm font-semibold text-foreground">{{ stats?.availableBeds ?? 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-destructive"></div>
                  <span class="text-sm font-medium text-foreground">Occupied Beds</span>
                </div>
                <span class="text-sm font-semibold text-foreground">{{ stats?.occupiedBeds ?? 0 }}</span>
              </div>
              <!-- Occupancy bar -->
              @if ((stats?.availableBeds ?? 0) + (stats?.occupiedBeds ?? 0) > 0) {
                <div class="h-4 w-full bg-muted rounded-full overflow-hidden flex mt-2">
                  <div class="h-full bg-success transition-all duration-500"
                    [style.width.%]="getOccupancyPercent('available')">
                  </div>
                  <div class="h-full bg-destructive transition-all duration-500"
                    [style.width.%]="getOccupancyPercent('occupied')">
                  </div>
                </div>
                <p class="text-xs text-muted-foreground text-center">
                  {{ getOccupancyPercent('occupied') | number:'1.0-0' }}% occupancy rate
                </p>
              } @else {
                <p class="text-sm text-muted-foreground text-center py-4">No bed data available yet.</p>
              }
            </div>
          </div>

          <!-- Booking Status -->
          <div class="bg-card rounded-xl border border-border p-6">
            <h3 class="font-semibold text-lg mb-4 text-foreground">Booking Status Overview</h3>
            @if (stats?.bookingsByStatus && objectKeys(stats.bookingsByStatus).length > 0) {
              <div class="space-y-3">
                @for (entry of getBookingStatusEntries(); track entry.key) {
                  <div class="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div class="flex items-center gap-2">
                      <div class="h-2.5 w-2.5 rounded-full" [ngClass]="getStatusDotColor(entry.key)"></div>
                      <span class="text-sm font-medium text-foreground capitalize">{{ entry.key.toLowerCase().replace('_', ' ') }}</span>
                    </div>
                    <span class="text-sm font-bold text-foreground">{{ entry.value }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <svg class="h-12 w-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-sm">No bookings data yet.</p>
              </div>
            }
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-card rounded-xl border border-border overflow-hidden">
          <div class="p-6 border-b border-border flex justify-between items-center">
            <h3 class="font-semibold text-lg text-foreground">Recent Bookings</h3>
            <a routerLink="/admin/bookings" class="text-xs font-medium text-primary hover:underline">View All</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-muted/30">
                  <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tenant</th>
                  <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (booking of stats?.recentBookings; track booking.id) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold text-foreground">{{ booking.tenant }}</span>
                        <span class="text-[10px] text-muted-foreground">{{ booking.email }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-foreground">₹{{ booking.amount | number }}</td>
                    <td class="px-6 py-4 text-xs">
                      <span [class]="getRecentBookingStatusClass(booking.status)">
                        {{ booking.status.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-xs text-muted-foreground">{{ booking.date | date:'shortDate' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-sm text-muted-foreground">
                      No recent bookings found.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-lg mb-4 text-foreground">Quick Actions</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a routerLink="/admin/rooms" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary transition-all cursor-pointer group text-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary" [innerHTML]="roomIcon"></div>
              <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Manage Rooms</span>
            </a>
            <a routerLink="/admin/bookings" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary transition-all cursor-pointer group text-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary" [innerHTML]="calendarIcon"></div>
              <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">View Bookings</span>
            </a>
            <a routerLink="/admin/tenants" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary transition-all cursor-pointer group text-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary" [innerHTML]="tenantsIcon"></div>
              <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Manage Tenants</span>
            </a>
            <a routerLink="/admin/users" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary transition-all cursor-pointer group text-center">
              <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary" [innerHTML]="settingsIcon"></div>
              <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">User Accounts</span>
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  adminName = 'Admin';
  objectKeys = Object.keys;

  roomIcon!: SafeHtml;
  occupiedIcon!: SafeHtml;
  availableIcon!: SafeHtml;
  pendingIcon!: SafeHtml;
  tenantsIcon!: SafeHtml;
  revenueIcon!: SafeHtml;
  calendarIcon!: SafeHtml;
  settingsIcon!: SafeHtml;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.initIcons();
  }

  private initIcons() {
    const icons = {
      room: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      occupied: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      available: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      pending: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      tenants: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
      revenue: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      calendar: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      settings: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/></svg>',
    };

    this.roomIcon = this.sanitizer.bypassSecurityTrustHtml(icons.room);
    this.occupiedIcon = this.sanitizer.bypassSecurityTrustHtml(icons.occupied);
    this.availableIcon = this.sanitizer.bypassSecurityTrustHtml(icons.available);
    this.pendingIcon = this.sanitizer.bypassSecurityTrustHtml(icons.pending);
    this.tenantsIcon = this.sanitizer.bypassSecurityTrustHtml(icons.tenants);
    this.revenueIcon = this.sanitizer.bypassSecurityTrustHtml(icons.revenue);
    this.calendarIcon = this.sanitizer.bypassSecurityTrustHtml(icons.calendar);
    this.settingsIcon = this.sanitizer.bypassSecurityTrustHtml(icons.settings);
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user?.name) {
        this.adminName = user.name;
      }
    });
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getOccupancyPercent(type: 'available' | 'occupied'): number {
    const total = (this.stats?.availableBeds ?? 0) + (this.stats?.occupiedBeds ?? 0);
    if (total === 0) return 0;
    return type === 'available'
      ? ((this.stats?.availableBeds ?? 0) / total) * 100
      : ((this.stats?.occupiedBeds ?? 0) / total) * 100;
  }

  getBookingStatusEntries(): { key: string; value: number }[] {
    if (!this.stats?.bookingsByStatus) return [];
    return Object.entries(this.stats.bookingsByStatus).map(([key, value]) => ({ key, value: value as number }));
  }

  getStatusDotColor(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'bg-success',
      PENDING: 'bg-warning',
      PENDING_PAYMENT: 'bg-warning',
      ACTIVE: 'bg-primary',
      COMPLETED: 'bg-muted-foreground',
      CANCELLED: 'bg-destructive',
    };
    return map[status] ?? 'bg-muted-foreground';
  }

  getRecentBookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'bg-success/10 text-success',
      PENDING: 'bg-warning/10 text-warning',
      PENDING_PAYMENT: 'bg-warning/10 text-warning',
      ACTIVE: 'bg-primary/10 text-primary',
      COMPLETED: 'bg-muted-foreground/10 text-muted-foreground',
      CANCELLED: 'bg-destructive/10 text-destructive',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] ?? 'bg-muted/50 text-muted-foreground'}`;
  }
}
