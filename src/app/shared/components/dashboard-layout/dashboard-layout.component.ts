import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-background">
      <!-- Header -->
      <app-header 
        (menuToggle)="toggleSidebar()" 
        [userName]="currentUser?.name || 'User'"
        [userRole]="currentUser?.role || 'USER'"
      ></app-header>

      <!-- Main Content Area -->
      <div class="flex flex-1 pt-16">
        <!-- Sidebar -->
        <app-sidebar 
          [isOpen]="isSidebarOpen"
          [userRole]="currentUser?.role || 'USER'"
          [userEmail]="currentUser?.email || ''"
          (close)="closeSidebar()"
        ></app-sidebar>

        <!-- Main Content -->
        <main 
          class="flex-1 flex flex-col transition-all duration-300 lg:ml-64 relative" 
        >
          <div class="flex-1 p-6">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <app-footer></app-footer>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = false;
  currentUser: User | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
