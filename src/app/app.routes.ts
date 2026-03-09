import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TenantHomeComponent } from './features/tenant/home/tenant-home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent)
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            {
                path: 'change-password',
                loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    {
        path: 'tenant',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard([UserRole.TENANT])],
        children: [
            { path: 'home', component: TenantHomeComponent },
            {
                path: 'my-room',
                loadComponent: () => import('./features/tenant/my-room/tenant-my-room.component').then(m => m.TenantMyRoomComponent)
            },
            {
                path: 'rooms',
                loadComponent: () => import('./features/tenant/rooms/tenant-rooms.component').then(m => m.TenantRoomsComponent)
            },
            {
                path: 'rooms/:roomId',
                loadComponent: () => import('./features/tenant/room-detail/tenant-room-detail.component').then(m => m.TenantRoomDetailComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./features/tenant/history/tenant-history.component').then(m => m.TenantHistoryComponent)
            },
            {
                path: 'complaints',
                loadComponent: () => import('./features/tenant/complaints/tenant-complaints.component').then(m => m.TenantComplaintsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/tenant/profile/tenant-profile.component').then(m => m.TenantProfileComponent)
            },
            {
                path: 'contact',
                loadComponent: () => import('./features/tenant/contact-us/contact-us.component').then(m => m.ContactUsComponent)
            },
            {
                path: 'book/:roomId',
                loadComponent: () => import('./features/tenant/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent)
            },
            {
                path: 'payment/:bookingId',
                loadComponent: () => import('./features/tenant/payment/payment.component').then(m => m.PaymentComponent)
            },
            {
                path: 'booking-success/:bookingId',
                loadComponent: () => import('./features/tenant/booking-success/booking-success.component').then(m => m.BookingSuccessComponent)
            },
            {
                path: 'modify-booking/:bookingId',
                loadComponent: () => import('./features/tenant/history/modify-booking.component').then(m => m.ModifyBookingComponent)
            }
        ]
    },
    {
        path: 'admin',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard([UserRole.ADMIN, UserRole.OWNER])],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'rooms',
                loadComponent: () => import('./features/admin/rooms/admin-rooms.component').then(m => m.AdminRoomsComponent)
            },
            {
                path: 'bookings',
                loadComponent: () => import('./features/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
            },
            {
                path: 'tenants',
                loadComponent: () => import('./features/admin/tenants/admin-tenants.component').then(m => m.AdminTenantsComponent)
            },
            {
                path: 'payments',
                loadComponent: () => import('./features/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/admin/profile/admin-profile.component').then(m => m.AdminProfileComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    // Fallback route
    { path: '**', redirectTo: 'auth/login' }
];

