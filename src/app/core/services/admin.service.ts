import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Complaint } from '../../models/complaint.model';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    // ============ DASHBOARD ============
    getDashboardStats(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard`);
    }

    // ============ COMPLAINT MANAGEMENT ============

    getAllComplaints(filters?: {
        status?: string;
        category?: string;
        priority?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
    }): Observable<ApiResponse<Complaint[]>> {
        let params = new HttpParams();

        if (filters) {
            if (filters.status) params = params.set('status', filters.status);
            if (filters.category) params = params.set('category', filters.category);
            if (filters.priority) params = params.set('priority', filters.priority);
            if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
            if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
            if (filters.search) params = params.set('search', filters.search);
        }

        return this.http.get<ApiResponse<Complaint[]>>(`${this.apiUrl}/complaints`, { params });
    }

    getComplaint(complaintId: string): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.apiUrl}/complaints/${complaintId}`);
    }

    assignComplaint(complaintId: string, staffUserId: string): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/assign`,
            { assignedTo: staffUserId }
        );
    }

    updateComplaintStatus(
        complaintId: string,
        status: string,
        notes?: string
    ): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/status`,
            { status, notes }
        );
    }

    addComplaintResponse(
        complaintId: string,
        action: string,
        notes?: string
    ): Observable<ApiResponse<Complaint>> {
        return this.http.post<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/response`,
            { action, notes }
        );
    }

    resolveComplaint(
        complaintId: string,
        resolutionNotes: string
    ): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/resolve`,
            { resolutionNotes }
        );
    }

    // Get staff users for assignment dropdown
    getStaffUsers(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/staff`);
    }
}
