/**
 * Standard API Response Format
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        [key: string]: unknown;
    };
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Error Response
 */
export interface ErrorResponse {
    success: false;
    error: string;
    details?: unknown;
    stack?: string; // Only in development
}

/**
 * Authentication Response
 */
export interface AuthResponse {
    success: boolean;
    data?: {
        token: string;
        user: {
            user_id: string;
            email: string;
            name: string;
            role: string;
        };
        expiresAt: string;
    };
    error?: string;
}
