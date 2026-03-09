import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../../models/booking.model';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

// We need custom interfaces for the data we send
export interface AdminCreateBookingData {
    tenantEmail: string;
    roomId: string;
    moveInDate: string;
    paymentMethod?: string;
}

export interface PaginatedBookingResponse {
    content: Booking[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminReservationService {
    private apiUrl = `${API_BASE_URL}/admin/bookings`;

    constructor(private http: HttpClient) { }

    /**
     * Get all bookings with pagination, filtering, and sorting
     */
    getBookings(
        page: number = 0,
        size: number = 10,
        filters?: {
            status?: string,
            dateFrom?: string,
            dateTo?: string,
            roomType?: string,
            searchQuery?: string,
            bookingDate?: string
        }
    ): Observable<ApiResponse<PaginatedBookingResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters?.roomType) params = params.set('roomType', filters.roomType);
        if (filters?.searchQuery) params = params.set('q', filters.searchQuery);
        if (filters?.bookingDate) params = params.set('bookingDate', filters.bookingDate);

        return this.http.get<ApiResponse<PaginatedBookingResponse>>(this.apiUrl, { params });
    }

    /**
     * Create a new booking explicitly by an admin
     */
    createBooking(data: AdminCreateBookingData): Observable<ApiResponse<Booking>> {
        return this.http.post<ApiResponse<Booking>>(this.apiUrl, data);
    }

    /**
     * Cancel an existing booking
     */
    cancelBooking(bookingId: string): Observable<ApiResponse<string>> {
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${bookingId}/cancel`, {});
    }
}
