// Room types and enums
export type RoomType = 'SINGLE_SHARING' | 'DOUBLE_SHARING' | 'TRIPLE_SHARING';

export interface Room {
    _id?: string;
    roomId?: string;
    roomNumber: string;
    roomType: RoomType;
    price: number;
    totalBeds: number;
    availableBeds: number;
    amenities: string[];
    images: string[];
    description: string;
    floor: number;
    roomSize: number;
    availability?: boolean;
    currentStatus?: string;
    hasActiveReservations?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRoomData {
    roomNumber: string;
    roomType: RoomType;
    price: number;
    totalBeds: number;
    floor: number;
    roomSize: number;
    images: string[];
    description: string;
}

export interface UpdateRoomData {
    roomNumber?: string;
    roomType?: RoomType;
    price?: number;
    totalBeds?: number;
    availableBeds?: number;
    floor?: number;
    roomSize?: number;
    images?: string[];
    description?: string;
}

export interface RoomFilterParams {
    roomType?: RoomType;
    minPrice?: number;
    maxPrice?: number;
    availability?: boolean;
    amenities?: string[]; availabilityDate?: string;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: string;
}

export interface PaginatedRoomResponse {
    content: Room[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}
