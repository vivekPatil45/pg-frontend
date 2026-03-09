import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-4xl mx-auto p-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-foreground">Contact Us</h1>
        <p class="text-muted-foreground mt-2">
          We're here to help! Reach out to us through any of the following channels.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 class="text-xl font-semibold text-foreground">Get in Touch</h2>
          
          <div class="flex items-start gap-4">
            <div class="p-3 bg-primary/10 rounded-lg text-primary">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-foreground">Visit Us</h3>
              <p class="text-muted-foreground">12, Koregaon Park Road, Pune, Maharashtra 411001</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="p-3 bg-primary/10 rounded-lg text-primary">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-foreground">Call Us</h3>
              <p class="text-muted-foreground">+91 98765 43210</p>
              <p class="text-muted-foreground">+91 91234 56789</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="p-3 bg-primary/10 rounded-lg text-primary">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-foreground">Email Us</h3>
              <p class="text-muted-foreground">support&#64;silverpg.com</p>
              <p class="text-muted-foreground">bookings&#64;silverpg.com</p>
            </div>
          </div>
        </div>

        <!-- Support Options -->
        <div class="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 class="text-xl font-semibold text-foreground">Support Options</h2>
          <div class="space-y-4">
             <div class="p-4 bg-muted rounded-lg">
                <h3 class="font-medium text-foreground mb-1">Frequently Asked Questions</h3>
                <p class="text-sm text-muted-foreground mb-3">Find answers to common questions about bookings, amenities, and policies.</p>
                <button class="text-primary text-sm font-medium hover:underline">View FAQs →</button>
             </div>

             <div class="p-4 bg-muted rounded-lg">
                <h3 class="font-medium text-foreground mb-1">Live Chat</h3>
                <p class="text-sm text-muted-foreground mb-3">Chat with our support team in real-time for immediate assistance.</p>
                <button class="text-primary text-sm font-medium hover:underline">Start Chat →</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContactUsComponent { }
