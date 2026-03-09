import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../../shared/utils/constants';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = API_BASE_URL;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get request headers with auth token
     */
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    /**
     * GET request
     */
    public get<T>(endpoint: string, params?: any): Observable<T> {
        const httpParams = new HttpParams({ fromObject: params || {} });
        return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
            headers: this.getHeaders(),
            params: httpParams
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * POST request
     */
    public post<T>(endpoint: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PUT request
     */
    public put<T>(endpoint: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * DELETE request
     */
    public delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PATCH request
     */
    public patch<T>(endpoint: string, body: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never> {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            errorMessage = error.error?.message || error.statusText || errorMessage;
        }

        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
