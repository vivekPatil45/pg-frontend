import { Room } from './room.model';
import { User } from './user.model';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'PENDING_PAYMENT';

export interface Booking {
    _id?: string;
    bookingId?: string;
    userId: string;
    user?: User;
    tenant?: any;
    roomId: string;
    room?: Room;
    bedId?: string;       // Assigned bed ID (from active-stay response)
    bedNumber?: number;   // Assigned bed number (from active-stay response)
    moveInDate: string;
    status: BookingStatus;
    paymentStatus: string;
    paymentMethod?: string;
    transactionId?: string;
    totalAmount?: number;
    cancellationDate?: string;
    cancellationReason?: string;
    payment?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBookingData {
    roomId: string;
    bedId: string;
    moveInDate: string;
}
