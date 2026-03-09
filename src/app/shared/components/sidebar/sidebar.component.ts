import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { cn } from '../../utils/cn.util';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <!-- Overlay for mobile -->
    @if (isOpen) {
      <div 
        class="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
        (click)="handleClose()"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      [class]="getSidebarClasses()"
    >
      <div class="flex flex-col h-full">
        <!-- Role Label -->
        <div class="px-4 py-4 border-b border-sidebar-border">
          <p class="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            {{ getRoleLabel() }}
          </p>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (item of getFilteredNavItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-sidebar-primary text-sidebar-primary-foreground"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="handleClose()"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span [innerHTML]="item.icon | safeHtml"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-sidebar-border">
          <div class="px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <p class="text-xs text-sidebar-foreground/60">Logged in as</p>
            <p class="text-sm font-medium text-sidebar-foreground truncate">
              {{ userEmail }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() userRole: string = 'USER';
  @Input() userEmail: string = 'user@example.com';
  @Output() close = new EventEmitter<void>();

  // Navigation items for each role
  private navItems: NavItem[] = [
    // User/Tenant navigation
    {
      label: 'Home',
      path: '/tenant/home',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
      roles: ['USER', 'TENANT']
    },
    {
      label: 'My Room',
      path: '/tenant/my-room',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
      roles: ['USER', 'TENANT']
    },
    {
      label: 'Search Rooms',
      path: '/tenant/rooms',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
      roles: ['USER', 'TENANT']
    },
    {
      label: 'My Bookings',
      path: '/tenant/history',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      roles: ['USER', 'TENANT']
    },
    {
      label: 'Profile',
      path: '/tenant/profile',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      roles: ['USER', 'TENANT']
    },
    {
      label: 'Contact Owner',
      path: '/tenant/contact',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
      roles: ['USER', 'TENANT']
    },

    // Owner navigation
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'Room Management',
      path: '/admin/rooms',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h-5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'Booking Management',
      path: '/admin/bookings',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'Tenants',
      path: '/admin/tenants',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'User Accounts',
      path: '/admin/users',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'Payment Management',
      path: '/admin/payments',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2z" /></svg>',
      roles: ['OWNER', 'ADMIN']
    },
    {
      label: 'Profile',
      path: '/admin/profile',
      icon: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      roles: ['OWNER', 'ADMIN']
    }
  ];

  handleClose() {
    this.close.emit();
  }

  getSidebarClasses(): string {
    return cn(
      'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border',
      'transition-transform duration-300 ease-in-out',
      'lg:translate-x-0',
      this.isOpen ? 'translate-x-0' : '-translate-x-full'
    );
  }

  getFilteredNavItems(): NavItem[] {
    return this.navItems.filter(item => item.roles.includes(this.userRole));
  }

  getRoleLabel(): string {
    switch (this.userRole) {
      case 'ADMIN':
      case 'OWNER': return 'Admin Portal';
      case 'USER':
      case 'TENANT': return 'Tenant Portal';
      default: return 'Navigation';
    }
  }
}
