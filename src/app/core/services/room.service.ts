import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../shared/utils/constants';
import { ApiResponse } from '../../models/user.model';
import { Room } from '../../models/room.model';

export interface RoomSearchCriteria {
    moveInDate: string;
    roomType: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    sortBy?: string;
    sortOrder?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private apiUrl = `${API_BASE_URL}/rooms`;

    constructor(private http: HttpClient) { }

    searchRooms(criteria: RoomSearchCriteria, page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        // Create a copy of the criteria and remove empty fields like roomType = ''
        const payload: any = { ...criteria };
        if (!payload.roomType) {
            delete payload.roomType;
        }

        // Post request body for search criteria as per backend controller
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/search`, payload, { params });
    }

    getRoomById(id: string): Observable<ApiResponse<Room>> {
        return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${id}`);
    }

    getRoomDetails(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/details`);
    }

    getAvailableBeds(roomId: string): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${roomId}/beds`);
    }

    getAllRooms(): Observable<ApiResponse<Room[]>> {
        return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}`);
    }
}
