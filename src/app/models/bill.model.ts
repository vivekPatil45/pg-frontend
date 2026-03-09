import { Booking } from './booking.model';
import { User } from './user.model';

export type BillStatus = 'PENDING' | 'PAID' | 'PARTIAL';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'ONLINE' | 'BANK_TRANSFER';

export interface BillItem {
    itemId?: string;
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Bill {
    billId: string;
    booking?: Booking;
    tenant?: User;
    billDate: string;
    items: BillItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentStatus: BillStatus;
    paymentMethod?: PaymentMethod;
    transactionId?: string;
    paidAmount: number;
    balanceAmount: number;
    invoiceGenerated: boolean;
    invoiceUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BillListResponse {
    content: Bill[];
    totalElements: number;
    totalPages: number;
}
