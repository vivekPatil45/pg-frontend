import { environment } from '../../../environments/environment';

// API base URL
export const API_BASE_URL = environment.apiUrl;

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',

    // Rooms
    ROOMS: '/rooms',
    ROOM_BY_ID: (id: string) => `/rooms/${id}`,

    // Beds
    BEDS: '/beds',
    BED_BY_ID: (id: string) => `/beds/${id}`,

    // Bookings
    BOOKINGS: '/bookings',
    BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
    MY_BOOKINGS: '/bookings/my',

    // Payments
    PAYMENTS: '/payments',
    PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
    MY_PAYMENTS: '/payments/my',

    // Tenants (Owner only)
    TENANTS: '/users/tenants',
    TENANT_BY_ID: (id: string) => `/users/tenants/${id}`,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    USER: 'pg_user_data',
    TOKEN: 'pg_auth_token',
} as const;

// Room amenities
export const ROOM_AMENITIES = [
    'WiFi',
    'AC',
    'TV',
    'Attached Bathroom',
    'Geyser',
    'Washing Machine',
    'Cupboard',
    'Study Table',
    'Balcony',
    'Power Backup',
    'CCTV Security',
    'RO Water',
    'Meals Included',
] as const;

export const COMPLAINT_CATEGORIES = [
    'MAINTENANCE',
    'CLEANLINESS',
    'FOOD',
    'SECURITY',
    'INTERNET',
    'OTHER'
] as const;

export const CONTACT_PREFERENCES = [
    'EMAIL',
    'CALL'
] as const;
