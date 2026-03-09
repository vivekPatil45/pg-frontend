import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Complaint } from '../../models/complaint.model';

@Injectable({
    providedIn: 'root'
})
export class StaffService {
    private apiUrl = `${environment.apiUrl}/staff`;

    constructor(private http: HttpClient) { }

    // Get complaints assigned to logged-in staff
    getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
        return this.http.get<ApiResponse<Complaint[]>>(`${this.apiUrl}/complaints`);
    }

    // Get detailed view of a specific complaint
    getComplaintDetail(complaintId: string): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.apiUrl}/complaints/${complaintId}`);
    }

    // Add action log to a complaint
    addAction(complaintId: string, action: string, notes?: string): Observable<ApiResponse<Complaint>> {
        return this.http.post<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/action`,
            { action, notes }
        );
    }

    // Update complaint status
    updateStatus(complaintId: string, status: string, notes?: string): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/status`,
            { status, notes }
        );
    }

    // Resolve a complaint
    resolveComplaint(complaintId: string, resolutionNotes: string): Observable<ApiResponse<Complaint>> {
        return this.http.put<ApiResponse<Complaint>>(
            `${this.apiUrl}/complaints/${complaintId}/resolve`,
            { resolutionNotes }
        );
    }
}
