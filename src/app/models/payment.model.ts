import { Booking } from './booking.model';
import { User } from './user.model';

export type PaymentStatus = 'Paid' | 'Pending' | 'Late';

export interface Payment {
    _id?: string;
    userId: string;
    user?: User;
    bookingId: string;
    booking?: Booking;
    amount: number;
    month: string;
    status: PaymentStatus;
    paymentDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePaymentData {
    userId: string;
    bookingId: string;
    amount: number;
    month: string;
}
