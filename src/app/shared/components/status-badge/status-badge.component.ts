import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn.util';

type BadgeStatus =
    | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'  // Room statuses
    | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PENDING_PAYMENT'    // Booking statuses
    | 'PAID' | 'UNPAID'                                       // Bill statuses
    | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';        // Complaint statuses

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span [class]="getBadgeClasses()">
      {{ getStatusText() }}
    </span>
  `,
    styles: []
})
export class StatusBadgeComponent {
    @Input() status!: BadgeStatus | string;
    @Input() className = '';

    getBadgeClasses(): string {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

        const statusClasses: Record<string, string> = {
            // Room statuses
            'AVAILABLE': 'badge-confirmed',
            'OCCUPIED': 'badge-booked',
            'MAINTENANCE': 'badge-pending',
            'RESERVED': 'badge-booked',

            // Booking statuses
            'PENDING': 'badge-pending',
            'CONFIRMED': 'badge-confirmed',
            'APPROVED': 'badge-confirmed',
            'REJECTED': 'badge-cancelled',
            'CANCELLED': 'badge-cancelled',
            'COMPLETED': 'badge-closed',
            'PENDING_PAYMENT': 'badge-pending',

            // Bill statuses
            'PAID': 'badge-paid',
            'UNPAID': 'badge-pending',

            // Complaint statuses
            'OPEN': 'badge-open',
            'IN_PROGRESS': 'badge-in-progress',
            'RESOLVED': 'badge-confirmed',
            'CLOSED': 'badge-closed',
        };

        return cn(
            baseClasses,
            statusClasses[this.status] || 'badge-open',
            this.className
        );
    }

    getStatusText(): string {
        return this.status.replace(/_/g, ' ');
    }
}
