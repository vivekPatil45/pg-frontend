import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, CreateUserResponse, UpdateUserRequest, UserListResponse, UserResponse } from '../../models/user-management.model';
import { ApiResponse, UserRole } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AdminUserService {
    private apiUrl = `${environment.apiUrl}/admin/users`;

    constructor(private http: HttpClient) { }

    getAllUsers(
        page: number = 0,
        size: number = 10,
        name?: string,
        role?: UserRole,
        sortBy: string = 'createdAt',
        sortDir: string = 'desc'
    ): Observable<ApiResponse<UserListResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('sortDir', sortDir);

        if (name) params = params.set('name', name);
        if (role) params = params.set('role', role);

        return this.http.get<ApiResponse<UserListResponse>>(this.apiUrl, { params });
    }

    getUserById(userId: string): Observable<ApiResponse<UserResponse>> {
        return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${userId}`);
    }

    createUser(request: CreateUserRequest): Observable<ApiResponse<CreateUserResponse>> {
        return this.http.post<ApiResponse<CreateUserResponse>>(this.apiUrl, request);
    }

    updateUser(userId: string, request: UpdateUserRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${userId}`, request);
    }

    deactivateUser(userId: string): Observable<ApiResponse<UserResponse>> {
        return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${userId}/deactivate`, {});
    }

    activateUser(userId: string): Observable<ApiResponse<UserResponse>> {
        return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${userId}/activate`, {});
    }

    resetPassword(userId: string): Observable<ApiResponse<{ userId: string; email: string; newPassword: string; message: string }>> {
        return this.http.post<ApiResponse<{ userId: string; email: string; newPassword: string; message: string }>>(`${this.apiUrl}/${userId}/reset-password`, {});
    }
}
