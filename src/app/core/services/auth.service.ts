import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData, ApiResponse, RegisterResponseData, AuthResponseData } from '../../models/user.model';
import { STORAGE_KEYS, API_BASE_URL } from '../../shared/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser$: Observable<User | null>;
    private apiUrl = `${API_BASE_URL}`;

    constructor(private http: HttpClient) {
        const storedUser = this.getStoredUser();
        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    /**
     * Get current user value
     */
    public getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return !!this.currentUserSubject.value && !!this.getToken();
    }

    /**
     * Register new user
     */
    public register(data: RegisterData): Observable<ApiResponse<RegisterResponseData>> {
        return this.http.post<ApiResponse<RegisterResponseData>>(`${this.apiUrl}/auth/register`, data)
            .pipe(
                tap(response => {
                    if (response.success) {
                        console.log('Registration successful:', response.data);
                    }
                }),
                catchError(error => {
                    console.error('Registration error:', error);
                    return throwError(() => error);
                })
            );
    }

    /**
     * Login user
     */
    public login(credentials: LoginCredentials): Observable<User> {
        return this.http.post<ApiResponse<AuthResponseData>>(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                map(response => {
                    if (response.success && response.data) {
                        const { token, user } = response.data;

                        // Create User object
                        const currentUser: User = {
                            userId: user.userId || user._id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            requirePasswordChange: user.requirePasswordChange
                        };

                        this.setSession(currentUser, token);
                        return currentUser;
                    }
                    throw new Error('Login failed');
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    return throwError(() => error);
                })
            );
    }

    /**
     * Logout user
     */
    public logout(): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/logout`, {})
            .pipe(
                tap(() => {
                    this.clearSession();
                }),
                map(() => void 0),
                catchError(error => {
                    // Clear session even if API call fails
                    this.clearSession();
                    return throwError(() => error);
                })
            );
    }

    /**
     * Get stored token
     */
    public getToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    /**
     * Set user session
     */
    private setSession(user: User, token: string): void {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        this.currentUserSubject.next(user);
    }

    /**
     * Clear user session
     */
    private clearSession(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        this.currentUserSubject.next(null);
    }

    /**
     * Get stored user from localStorage
     */
    private getStoredUser(): User | null {
        const userJson = localStorage.getItem(STORAGE_KEYS.USER);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Update user profile in session
     */
    public updateSession(user: Partial<User>): void {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...user };
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
        }
    }

    /**
     * Mock update profile (kept for compatibility)
     */
    public updateProfile(user: Partial<User>): Observable<User> {
        return new Observable(observer => {
            this.updateSession(user);
            observer.next(this.getCurrentUser()!);
            observer.complete();
        });
    }
    /**
     * Change password
     */
    public changePassword(data: any): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/users/change-password`, data);
    }
}
