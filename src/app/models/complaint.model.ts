import { User } from './user.model';

// Complaint status
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Complaint interface
export interface Complaint {
    id?: number;
    complaintId: string;
    customerId?: number; // Deprecated - use customer.customerId instead
    customer?: {
        customerId: string;
        user: {
            userId: number;
            fullName: string;
            email: string;
            phoneNumber?: string;
        };
    };
    bookingId?: string;
    category: string;
    title: string;
    description: string;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    contactPreference?: string;
    expectedResolutionDate?: string;
    assignedTo?: string;
    resolutionNotes?: string;
    actionLog?: ActionLog[];
    createdAt?: string;
    updatedAt?: string;
    resolvedAt?: string;
}

export interface ActionLog {
    actionId?: string;
    performedBy: string;
    action: string;
    timestamp: string;
}

// Create complaint data (matches backend ComplaintRequest)
export interface ComplaintRequest {
    bookingId?: string;
    category: string;
    title: string;
    description: string;
    contactPreference: string;
}

// Update complaint data
export interface UpdateComplaintData {
    status?: ComplaintStatus;
    assignedToId?: number;
    resolution?: string;
}
