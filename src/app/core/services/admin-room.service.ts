import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Room,
    CreateRoomData,
    UpdateRoomData,
    RoomFilterParams,
    PaginatedRoomResponse
} from '../../models/room.model';
import { ApiResponse } from '../../models/user.model';
import { API_BASE_URL } from '../../shared/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class AdminRoomService {
    private apiUrl = `${API_BASE_URL}/admin/rooms`;

    constructor(private http: HttpClient) { }

    /**
     * Get all rooms with optional filtering and pagination
     */
    getRooms(filters?: RoomFilterParams, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedRoomResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters) {
            if (filters.roomType) params = params.set('roomType', filters.roomType);
            if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
            if (filters.availability !== undefined) params = params.set('availability', filters.availability.toString());
            if (filters.amenities && filters.amenities.length > 0) {
                filters.amenities.forEach(a => params = params.append('amenities', a));
            }

            if (filters.availabilityDate) params = params.set('availabilityDate', filters.availabilityDate);
            if (filters.searchQuery) params = params.set('q', filters.searchQuery);
            if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
            if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
        }

        return this.http.get<ApiResponse<PaginatedRoomResponse>>(this.apiUrl, { params });
    }

    /**
     * Get single room by ID
     */
    getRoomById(roomId: string): Observable<ApiResponse<Room>> {
        return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${roomId}`);
    }

    /**
     * Create new room
     */
    createRoom(data: CreateRoomData): Observable<ApiResponse<Room>> {
        return this.http.post<ApiResponse<Room>>(this.apiUrl, data);
    }

    /**
     * Update existing room
     */
    updateRoom(roomId: string, data: UpdateRoomData): Observable<ApiResponse<Room>> {
        return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/${roomId}`, data);
    }

    /**
     * Search rooms by query
     */
    searchRooms(query: string, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedRoomResponse>> {
        const params = new HttpParams()
            .set('q', query)
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<PaginatedRoomResponse>>(`${this.apiUrl}/search`, { params });
    }

    /**
     * Delete a room
     */
    deleteRoom(roomId: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${roomId}`);
    }

    /**
     * Bulk import rooms from CSV
     */
    bulkImportRooms(file: File): Observable<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bulk-import`, formData);
    }

    /**
     * Download CSV template for room import
     */
    downloadTemplate(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' });
    }
}
