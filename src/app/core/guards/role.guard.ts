import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
            router.navigate(['/auth/login']);
            return false;
        }

        if (allowedRoles.includes(currentUser.role)) {
            return true;
        }

        switch (currentUser.role) {
            case UserRole.TENANT:
                router.navigate(['/tenant/home']);
                break;
            case UserRole.OWNER:
                router.navigate(['/admin/dashboard']);
                break;
            default:
                router.navigate(['/auth/login']);
        }

        return false;
    };
};
