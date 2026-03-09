import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../shared/utils/constants';
import { ApiResponse } from '../../models/user.model';
import { Room } from '../../models/room.model';

import { Booking, CreateBookingData } from '../../models/booking.model';

export interface PaymentRequest {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET'; // Adjust generic types as needed
    transactionId: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${API_BASE_URL}/tenant/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(request: CreateBookingData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(this.apiUrl, request);
    }

    getBookingById(bookingId: string): Observable<ApiResponse<Booking>> {
        return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/${bookingId}`);
    }

    confirmPayment(bookingId: string, payment: PaymentRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${bookingId}/payment`, payment);
    }

    checkModification(bookingId: string, request: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${bookingId}/check-modification`, request);
    }

    modifyBooking(bookingId: string, request: any): Observable<ApiResponse<Booking>> {
        return this.http.put<ApiResponse<Booking>>(`${this.apiUrl}/${bookingId}`, request);
    }

    getMyBookings(page: number = 0, size: number = 10, status?: string): Observable<ApiResponse<any>> {
        let params = `?page=${page}&size=${size}`;
        if (status) {
            params += `&status=${status}`;
        }
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}${params}`);
    }

    checkCancellation(bookingId: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${bookingId}/check-cancellation`);
    }

    cancelBooking(bookingId: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${bookingId}`, {
            body: { cancellationReason: 'User requested cancellation' }
        });
    }
}
