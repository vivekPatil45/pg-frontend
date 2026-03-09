import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background text-foreground">

      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center gap-2">
              <svg class="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-xl font-bold tracking-tight text-primary">SilverPG</span>
            </div>

            <!-- Desktop Nav auth buttons (conditional) -->
            @if (isLoggedIn) {
              <div class="hidden md:flex items-center gap-4">
                <div class="flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/40 border border-border">
                  <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm">
                    {{ (loggedInName[0] || 'U').toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-foreground pr-1">Hi, {{ loggedInName }}</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <a [routerLink]="dashboardLink" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    Dashboard
                  </a>
                  <button (click)="handleLogout()" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-border text-muted-foreground rounded-lg hover:bg-muted transition-all active:scale-95">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Logout
                  </button>
                </div>
              </div>
            } @else {
              <div class="hidden md:flex items-center gap-3">
                <a routerLink="/auth/login" class="px-5 py-2 text-sm font-semibold border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-all">
                  Login
                </a>
                <a routerLink="/auth/register" class="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                  Get Started
                </a>
              </div>
            }

            <!-- Mobile menu button -->
            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="md:hidden text-foreground p-1">
              @if (mobileMenuOpen()) {
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              } @else {
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden bg-background border-t border-border px-4 py-6 space-y-6 animate-in slide-in-from-top duration-300">
            <div class="space-y-4 px-2">
              <a href="#rooms" (click)="mobileMenuOpen.set(false)" class="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Rooms
              </a>
              <a href="#facilities" (click)="mobileMenuOpen.set(false)" class="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                Facilities
              </a>
              <a href="#amenities" (click)="mobileMenuOpen.set(false)" class="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"/></svg>
                Amenities
              </a>
              <a href="#contact" (click)="mobileMenuOpen.set(false)" class="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Contact
              </a>
            </div>

            <div class="px-2 pt-4 border-t border-border">
              @if (isLoggedIn) {
                <div class="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/30">
                  <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                    {{ (loggedInName[0] || 'U').toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-foreground">Hi, {{ loggedInName }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider">Logged In</span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <a [routerLink]="dashboardLink" (click)="mobileMenuOpen.set(false)" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm active:scale-95 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    Dashboard
                  </a>
                  <button (click)="handleLogout(); mobileMenuOpen.set(false)" class="flex flex-col items-center gap-2 p-3 rounded-xl border border-border text-muted-foreground font-semibold text-xs active:scale-95 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Logout
                  </button>
                </div>
              } @else {
                <div class="grid grid-cols-1 gap-3">
                  <a routerLink="/auth/register" (click)="mobileMenuOpen.set(false)" class="w-full text-center py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all">
                    Get Started
                  </a>
                  <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)" class="w-full text-center py-3 border border-border text-foreground rounded-xl font-bold text-sm active:scale-95 transition-all">
                    Login
                  </a>
                </div>
              }
            </div>
          </div>
        }
      </nav>

      <!-- Hero Section -->
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop" alt="SilverPG Accommodations" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p class="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-medium">Welcome to</p>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            SilverPG Accommodations
          </h1>
          <p class="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Experience comfortable living, delicious meals, and top-tier amenities tailored for students and professionals.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/auth/register" class="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg shadow-lg">
              Book Your Bed
            </a>
            <a href="#rooms" class="px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-lg">
              Explore Rooms
            </a>
          </div>
        </div>
        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg class="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      <!-- Rooms Section -->
      <section id="rooms" class="py-24 px-4 bg-background">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">Accommodations</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">Our Rooms</h2>
            <p class="text-muted-foreground mt-3 max-w-lg mx-auto">Each room is thoughtfully designed to provide the ultimate comfort and a productive atmosphere for your stay.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            @for (room of rooms; track room.name) {
              <div class="group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div class="overflow-hidden h-56">
                  <img [src]="room.image" [alt]="room.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xl font-semibold text-card-foreground">{{ room.name }}</h3>
                    <span class="text-primary font-bold text-lg">{{ room.price }}<span class="text-xs text-muted-foreground font-normal">/month</span></span>
                  </div>
                  <p class="text-muted-foreground text-sm mb-5">{{ room.desc }}</p>
                  <a routerLink="/auth/register" class="block w-full text-center py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Book Now
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Facilities Section -->
      <section id="facilities" class="py-24 px-4 bg-muted/50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">Premium Experience</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">PG Facilities</h2>
            <p class="text-muted-foreground mt-3 max-w-lg mx-auto">Indulge in our premium facilities designed for your comfort and convenience.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            @for (f of facilities; track f.name) {
              <div class="group relative rounded-xl overflow-hidden h-80 shadow-md">
                <img [src]="f.image" [alt]="f.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-6">
                  <h3 class="text-xl font-bold text-white mb-1">{{ f.name }}</h3>
                  <p class="text-white/75 text-sm">{{ f.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Amenities Section -->
      <section id="amenities" class="py-24 px-4 bg-background">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-14">
            <p class="text-primary uppercase tracking-[0.2em] text-sm font-medium mb-2">Everything You Need</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground">Amenities & Services</h2>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            @for (a of amenities; track a.label) {
              <div class="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200">
                <div class="mb-3 text-primary" [innerHTML]="a.icon"></div>
                <span class="text-sm font-medium text-card-foreground">{{ a.label }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Testimonial / CTA -->
      <section class="py-24 px-4 bg-primary text-primary-foreground">
        <div class="max-w-3xl mx-auto text-center">
          <svg class="h-10 w-10 mx-auto mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <blockquote class="text-2xl sm:text-3xl font-light italic mb-6 leading-relaxed">
            "An unforgettable experience. The environment, the rooms, the food — everything was absolutely perfect for my studies."
          </blockquote>
          <p class="font-semibold mb-8">— Rahul Sharma, Engineering Student</p>
          <a routerLink="/auth/register" class="inline-block px-8 py-3 bg-primary-foreground text-primary font-semibold rounded-md hover:opacity-90 transition-opacity text-lg shadow-md">
            Reserve Your Bed Today
          </a>
        </div>
      </section>

      <!-- Contact / Footer -->
      <footer id="contact" class="bg-card border-t border-border py-16 px-4">
        <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-lg font-bold text-primary">SilverPG</span>
            </div>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Living redefined. SilverPG has been the premier destination for students and professionals seeking the finest in modern PG accommodations.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-card-foreground mb-4">Quick Links</h4>
            <div class="space-y-2 text-sm">
              <a href="#rooms" class="block text-muted-foreground hover:text-primary transition-colors">Rooms &amp; Suites</a>
              <a href="#facilities" class="block text-muted-foreground hover:text-primary transition-colors">Facilities</a>
              <a href="#amenities" class="block text-muted-foreground hover:text-primary transition-colors">Amenities</a>
              <a routerLink="/auth/login" class="block text-muted-foreground hover:text-primary transition-colors">Login</a>
              <a routerLink="/auth/register" class="block text-muted-foreground hover:text-primary transition-colors">Register</a>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-card-foreground mb-4">Contact Us</h4>
            <div class="space-y-3 text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                12, Koregaon Park Road, Pune, Maharashtra
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +91 98765 43210
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                support&#64;silverpg.com
              </div>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 SilverPG. All rights reserved.
        </div>
      </footer>

    </div>
  `,
  styles: [`
    html { scroll-behavior: smooth; }
  `]
})
export class LandingPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  mobileMenuOpen = signal(false);

  isLoggedIn = false;
  loggedInName = '';
  dashboardLink = '/tenant/home';

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.loggedInName = user?.name?.split(' ')[0] || '';
      if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
        this.dashboardLink = '/admin/dashboard';
      } else if (user?.role === 'TENANT') {
        this.dashboardLink = '/tenant/home';
      }
    });
  }

  handleLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }


  rooms = [
    { name: 'Single Sharing Room', price: '₹12,000', image: 'assets/room3.png', desc: 'Private room with modern amenities, perfect for professionals.' },
    { name: 'Double Sharing Room', price: '₹8,500', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop', desc: 'Shared luxury with ample space, study tables, and premium furnishings.' },
    { name: 'Triple Sharing Room', price: '₹6,500', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop', desc: 'Economical yet comfortable staying option for students.' }
  ];

  facilities = [
    { name: 'High-Speed WiFi', image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop', desc: 'Reliable and fast internet connectivity for all your work and study needs.' },
    { name: 'Nutritious Meals', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', desc: 'Wholesome and hygienic home-style food prepared daily.' },
    { name: '24/7 Security', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=800&auto=format&fit=crop', desc: 'Round the clock CCTV surveillance and security guards for peace of mind.' }
  ];

  amenities: { label: string; icon: SafeHtml }[] = [
    {
      label: 'Free High-Speed WiFi',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>')
    },
    {
      label: 'Valet Parking',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 6H4l-1 6h16l-2-6h-4z"/></svg>')
    },
    {
      label: '24/7 Room Service',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a6 6 0 0112 0H6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 20h18"/></svg>')
    },
    {
      label: 'Fitness Center',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h2m0-2v4m14-4v4m2-2h-2m-5-4v12m-4-6h4"/></svg>')
    },
    {
      label: '24/7 Security',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>')
    },
    {
      label: 'Concierge Service',
      icon: this.safe('<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>')
    }
  ];

  private safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
