import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Navy Blue Branding Section -->
      <div class="hidden lg:flex lg:w-1/2 bg-hotel-navy text-white p-12 flex-col justify-between relative overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-12">
            <div class="p-2 bg-hotel-gold rounded-lg">
              <svg class="h-8 w-8 text-hotel-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-2xl font-bold">Silver<span class="text-hotel-gold">PG</span></span>
          </div>

          <!-- Welcome Text -->
          <div class="space-y-4">
            <h1 class="text-4xl font-bold leading-tight">Welcome to Premium Living</h1>
            <p class="text-lg text-gray-300 max-w-md">
              Experience world-class hospitality with our premium amenities and exceptional service. Your comfort is our priority.
            </p>
          </div>

          <!-- Features List -->
          <div class="mt-12 space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-hotel-gold"></div>
              <span class="text-gray-300">24/7 Security & Support</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-hotel-gold"></div>
              <span class="text-gray-300">Fully Furnished Rooms</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-hotel-gold"></div>
              <span class="text-gray-300">Nutritious Daily Meals</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-hotel-gold"></div>
              <span class="text-gray-300">High-Speed WiFi</span>
            </div>
          </div>
        </div>

        <!-- Bottom Decoration -->
        <div class="relative z-10">
          <div class="h-1 w-24 bg-hotel-gold rounded-full"></div>
        </div>
      </div>

      <!-- Right Side - Form Section -->
      <div class="flex-1 flex items-center justify-center p-8 bg-background">
        <div class="w-full max-w-md">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent {
  currentYear = new Date().getFullYear();
}
