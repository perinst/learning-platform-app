/**
 * User Entity
 */
export interface User {
    user_id: string;
    user_email: string;
    user_name: string;
    user_role: 'admin' | 'user';
    user_created_at: string;
}

/**
 * Authenticated User (in request)
 */
export interface AuthenticatedUser {
    user_id: string;
    email: string;
    name: string;
    role: string;
    token_expires_at: string;
}

/**
 * FreeImage.host Response
 */
export interface FreeImageResponse {
    status_code: number;
    image?: {
        url: string;
        display_url: string;
    };
    error?: {
        message: string;
    };
}

/**
 * Upload Result
 */
export interface UploadResult {
    success: boolean;
    url?: string;
    display_url?: string;
    error?: string;
}

// Re-export all types
export * from './api.types';
export * from './lesson.types';
