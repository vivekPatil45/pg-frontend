import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

export interface AdminBookingResponse {
    bookingId: string;
    tenantName: string;
    tenantPhone: string;
    tenantEmail: string;
    roomNumber: string;
    bedNumber: string;
    requestedRoomType: string;
    requestedBedId?: string;
    moveInDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    adminNotes: string;
    createdAt: string;
}

export interface PaginatedBookingResponse {
    content: AdminBookingResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminBookingService {
    private apiUrl = `${API_BASE_URL}/admin/bookings`;

    constructor(private http: HttpClient) { }

    getBookings(status?: string, search?: string, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedBookingResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (status) params = params.set('status', status);
        if (search) params = params.set('search', search);

        return this.http.get<ApiResponse<PaginatedBookingResponse>>(this.apiUrl, { params });
    }

    approveBooking(bookingId: string, roomId: string, bedId: string, notes: string): Observable<ApiResponse<AdminBookingResponse>> {
        return this.http.put<ApiResponse<AdminBookingResponse>>(`${this.apiUrl}/${bookingId}/approve`, { roomId, bedId, notes });
    }

    rejectBooking(bookingId: string, reason: string): Observable<ApiResponse<AdminBookingResponse>> {
        return this.http.put<ApiResponse<AdminBookingResponse>>(`${this.apiUrl}/${bookingId}/reject`, { reason });
    }

    cancelBooking(bookingId: string, reason: string): Observable<ApiResponse<AdminBookingResponse>> {
        return this.http.put<ApiResponse<AdminBookingResponse>>(`${this.apiUrl}/${bookingId}/cancel`, { reason });
    }
}
