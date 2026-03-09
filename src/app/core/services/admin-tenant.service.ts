import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

export interface TenantResponse {
    tenantId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    roomNumber: string | null;
    bedNumber: number | null;
    idProof: string | null;
    checkInDate: string | null;
    preferredRoomType: string;
    status: string;
}

export interface PaginatedTenantResponse {
    content: TenantResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminTenantService {
    private apiUrl = `${API_BASE_URL}/admin/tenants`;

    constructor(private http: HttpClient) { }

    getTenants(filters?: any, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedTenantResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters) {
            if (filters.search) params = params.set('search', filters.search);
            if (filters.status) params = params.set('status', filters.status);
            if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
            if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
        }

        return this.http.get<ApiResponse<PaginatedTenantResponse>>(this.apiUrl, { params });
    }

    updateTenant(tenantId: string, data: Partial<TenantResponse>): Observable<ApiResponse<TenantResponse>> {
        return this.http.put<ApiResponse<TenantResponse>>(`${this.apiUrl}/${tenantId}`, data);
    }

    checkoutTenant(tenantId: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${tenantId}/checkout`, {});
    }
}
