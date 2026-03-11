import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

export interface AdminBillResponse {
    billId: string;
    tenantName: string;
    tenantPhone: string;
    roomNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    billDate: string;
    dueDate: string;
    paymentStatus: string;
    paymentMethod?: string;
    transactionId: string;
    createdAt: string;
}

export interface PaginatedBillResponse {
    content: AdminBillResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminPaymentService {
    private apiUrl = `${API_BASE_URL}/admin/payments`;

    constructor(private http: HttpClient) { }

    getPayments(status?: string, search?: string, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedBillResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (status) params = params.set('status', status);
        if (search) params = params.set('search', search);

        return this.http.get<ApiResponse<PaginatedBillResponse>>(this.apiUrl, { params });
    }

    markReceived(billId: string, amount: number, paymentMethod: string): Observable<ApiResponse<AdminBillResponse>> {
        return this.http.put<ApiResponse<AdminBillResponse>>(`${this.apiUrl}/${billId}/receive`, { amount, paymentMethod });
    }

    generateReceipt(billId: string): Observable<ApiResponse<AdminBillResponse>> {
        return this.http.post<ApiResponse<AdminBillResponse>>(`${this.apiUrl}/${billId}/receipt`, {});
    }
}
