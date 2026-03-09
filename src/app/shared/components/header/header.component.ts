import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-16">
      <div class="flex items-center justify-between h-full px-4">
        <!-- Left: Menu toggle & Logo -->
        <div class="flex items-center gap-4">
          <button
            (click)="toggleSidebar()"
            class="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            @if (isSidebarOpen) {
              <svg class="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>
          
          <a routerLink="/" class="flex items-center gap-2">
            <div class="p-2 bg-primary rounded-lg">
              <svg class="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-xl font-bold text-foreground hidden sm:block">
              Silver<span class="text-secondary">PG</span>
            </span>
          </a>
        </div>

        <!-- Right: Notifications & User menu -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <button class="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button
              (click)="toggleUserMenu()"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <svg class="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-foreground">{{ userName }}</p>
                <p class="text-xs text-muted-foreground">{{ userRole }}</p>
              </div>
            </button>

            <!-- Dropdown -->
            @if (isUserMenuOpen) {
                <div 
                  class="fixed inset-0" 
                  (click)="toggleUserMenu()"
                ></div>
                <div class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 animate-slide-down">
                  <div class="px-4 py-2 border-b border-border md:hidden">
                    <p class="text-sm font-medium text-foreground">{{ userName }}</p>
                    <p class="text-xs text-muted-foreground">{{ userRole }}</p>
                  </div>
                  
                  @if (userRole === 'USER') {
                    <a
                      routerLink="/tenant/profile"
                      (click)="toggleUserMenu()"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Profile Settings
                    </a>
                  }
                  
                  <button
                    (click)="handleLogout()"
                    class="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();
  isSidebarOpen = false; // local state for icon toggle logic
  isUserMenuOpen = false;
  @Input() userName: string = 'User';
  @Input() userRole: string = 'USER';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.menuToggle.emit();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  handleLogout() {
    this.isUserMenuOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Even if API call fails, we should clear local session and redirect
        // AuthService.logout() handles clearSession in its catchError/finalize
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
