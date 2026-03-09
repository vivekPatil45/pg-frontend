import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintRequest } from '../../models/complaint.model';
import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {
    private apiUrl = `${environment.apiUrl}/customer/complaints`;

    constructor(private http: HttpClient) { }

    registerComplaint(complaintData: ComplaintRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(this.apiUrl, complaintData);
    }

    getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
        return this.http.get<ApiResponse<Complaint[]>>(this.apiUrl);
    }

    getComplaintById(complaintId: string): Observable<ApiResponse<Complaint>> {
        return this.http.get<ApiResponse<Complaint>>(`${this.apiUrl}/${complaintId}`);
    }
}
