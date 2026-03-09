import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

export interface Bed {
    bedId: string;
    bedNumber: number;
    room: any; // Room object
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
    tenant: any | null; // Tenant object or null
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminBedService {
    private apiUrl = `${API_BASE_URL}/admin/beds`;

    constructor(private http: HttpClient) { }

    getBedsByRoom(roomId: string): Observable<ApiResponse<Bed[]>> {
        return this.http.get<ApiResponse<Bed[]>>(`${this.apiUrl}/room/${roomId}`);
    }

    assignTenantToBed(bedId: string, tenantId: string): Observable<ApiResponse<Bed>> {
        return this.http.put<ApiResponse<Bed>>(`${this.apiUrl}/${bedId}/assign`, { tenantId });
    }

    markBedAvailable(bedId: string): Observable<ApiResponse<Bed>> {
        return this.http.put<ApiResponse<Bed>>(`${this.apiUrl}/${bedId}/available`, {});
    }

    updateBedStatus(bedId: string, status: string): Observable<ApiResponse<Bed>> {
        return this.http.put<ApiResponse<Bed>>(`${this.apiUrl}/${bedId}/status`, { status });
    }
}
