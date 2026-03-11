import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../shared/utils/constants';
import { User, ApiResponse } from '../../models/user.model';
import { Booking } from '../../models/booking.model';
import { Bill, BillListResponse } from '../../models/bill.model';
import { Complaint } from '../../models/complaint.model';

export interface ComplaintRequest {
    bookingId?: string | null;
    category: string;
    title: string;
    description: string;
    contactPreference: string;
}

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private apiUrl = `${API_BASE_URL}/tenant`;
    private complaintsUrl = `${API_BASE_URL}/tenant/complaints`;

    constructor(private http: HttpClient) { }

    // Profile Management
    getProfile(userId: string): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${userId}`);
    }

    updateProfile(userId: string, data: Partial<User>): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${userId}`, data);
    }

    // Complaint Management
    getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
        return this.http.get<ApiResponse<Complaint[]>>(`${this.complaintsUrl}`);
    }

    createComplaint(complaint: ComplaintRequest): Observable<ApiResponse<Complaint>> {
        return this.http.post<ApiResponse<Complaint>>(this.complaintsUrl, complaint);
    }

    getComplaint(id: number): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.complaintsUrl}/${id}`);
    }

    getComplaintById(complaintId: string): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.complaintsUrl}/${complaintId}`);
    }

    updateComplaintStatus(complaintId: string, status: string): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(`${this.complaintsUrl}/${complaintId}/status`, { status });
    }

    updateComplaint(complaintId: string, complaint: ComplaintRequest): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(`${this.complaintsUrl}/${complaintId}`, complaint);
    }

    // Stay & Billing
    getActiveStay(): Observable<ApiResponse<Booking>> {
        return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/active-stay`);
    }

    getMyBills(page: number = 0, size: number = 10): Observable<ApiResponse<BillListResponse>> {
        return this.http.get<ApiResponse<BillListResponse>>(`${this.apiUrl}/bills`, {
            params: { page: page.toString(), size: size.toString() }
        });
    }

    payRent(bookingId: string, paymentMethod: string, transactionId: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${this.apiUrl}/bookings/${bookingId}/pay-rent`,
            { paymentMethod, transactionId }
        );
    }
}
