import { UserRole } from './user.model';

export interface UserResponse {
    _id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    profileImage?: string;
    idProof?: string;
    role: UserRole;
    requirePasswordChange: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserListResponse {
    users: UserResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
}

export interface CreateUserResponse extends UserResponse {
    generatedPassword?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
}
