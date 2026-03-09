import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminBillResponse {
    content: any[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminBillService {
    private apiUrl = `${environment.apiUrl}/admin/bills`;

    constructor(private http: HttpClient) { }

    getAllBills(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: string = 'desc',
        q?: string,
        dateFrom?: string,
        dateTo?: string,
        paymentStatus?: string,
        minAmount?: string,
        maxAmount?: string
    ): Observable<{ success: boolean; message: string; data: AdminBillResponse }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('sortOrder', sortOrder);

        if (q) params = params.set('q', q);
        if (dateFrom) params = params.set('dateFrom', dateFrom);
        if (dateTo) params = params.set('dateTo', dateTo);
        if (paymentStatus) params = params.set('paymentStatus', paymentStatus);
        if (minAmount) params = params.set('minAmount', minAmount);
        if (maxAmount) params = params.set('maxAmount', maxAmount);

        return this.http.get<{ success: boolean; message: string; data: AdminBillResponse }>(this.apiUrl, { params });
    }

    generateBill(bookingId: string): Observable<{ success: boolean; message: string; data: any }> {
        return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/generate/${bookingId}`, {});
    }

    addBillItem(billId: string, item: any): Observable<{ success: boolean; message: string; data: any }> {
        return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${billId}/items`, item);
    }

    markBillAsPaid(billId: string, amount: number, paymentMethod: string = 'CASH'): Observable<{ success: boolean; message: string; data: any }> {
        return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${billId}/pay`, { amount, paymentMethod });
    }
}
