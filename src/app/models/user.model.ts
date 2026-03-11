export enum UserRole {
    TENANT = 'TENANT',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    STAFF = 'STAFF'
}

export interface User {
    _id?: string;
    userId?: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    requirePasswordChange?: boolean;
    address?: string;
    profileImage?: string;
    idProof?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    address?: string;
    profileImage?: string;
    idProof?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
    timestamp?: string;
}

export interface RegisterResponseData {
    userId: string;
    name: string;
    email: string;
    message: string;
}

export interface AuthResponseData {
    token: string;
    user: User;
}
