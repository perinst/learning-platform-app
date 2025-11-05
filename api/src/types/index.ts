// User types
export interface User {
    user_id: string;
    user_email: string;
    user_name: string;
    user_role: 'admin' | 'user';
    user_created_at: string;
}

// FreeImage.host response types
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
