// Backend API Types (matching PostgreSQL schema)

export interface User {
    id: string; // UUID
    email: string;
    name: string;
    role: 'admin' | 'user';
    created_at: string; // ISO timestamp
    password?: string; // Only included in mock data, never from API
}

export interface QuestionChoice {
    id?: number;
    choice_text: string;
    is_correct: boolean;
    display_order: number;
}

export interface LessonQuestion {
    id?: number;
    question_text: string;
    display_order: number;
    choices: QuestionChoice[];
}

export interface LessonApplication {
    id?: number;
    title: string;
    description: string;
    examples?: string[];
    display_order: number;
}

export interface Lesson {
    id: number; // Auto-increment ID
    title: string;
    description: string;
    content: string;
    category: string;
    status: 'draft' | 'published';
    image_url?: string;
    summary?: string;
    created_at: string; // ISO timestamp
    created_by: string; // UUID (user_id)
    applications?: LessonApplication[];
    questions?: LessonQuestion[];
    relevant_start_day?: number; // Day of year (1-366) when lesson becomes relevant
    relevant_end_day?: number; // Day of year (1-366) when lesson relevance ends
}

export interface Progress {
    user_id: string; // UUID
    lesson_id: number; // Auto-increment ID
    progress: number; // 0-100
    completed: boolean;
    last_accessed: string; // ISO timestamp
}

export interface ChatMessage {
    id: number; // Auto-increment ID
    user_id: string; // UUID
    lesson_id: number; // Auto-increment ID
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // ISO timestamp
}

export interface AccessToken {
    user_id: string;
    user_email: string;
    user_name: string;
    user_role: 'admin' | 'user';
    user_created_at: string;
    access_token: string;
    expires_at: string;
}

// API Request/Response Types
export interface LoginRequest {
    p_email: string;
    p_password: string;
}

export interface RegisterRequest {
    p_email: string;
    p_password: string;
    p_name: string;
    p_role?: 'user' | 'admin';
}

export interface CreateLessonRequest {
    p_token: string;
    p_title: string;
    p_description: string;
    p_content: string;
    p_category: string;
    p_status: 'draft' | 'published';
    p_image_url?: string;
    p_summary?: string;
    p_applications?: LessonApplication[];
    p_questions?: LessonQuestion[];
    p_relevant_start_day?: number;
    p_relevant_end_day?: number;
}

export interface UpdateLessonRequest {
    p_token: string;
    p_lesson_id: number;
    p_title: string;
    p_description: string;
    p_content: string;
    p_category: string;
    p_status: 'draft' | 'published';
    p_image_url?: string;
    p_summary?: string;
    p_applications?: LessonApplication[];
    p_questions?: LessonQuestion[];
}

export interface DeleteLessonRequest {
    p_token: string;
    p_lesson_id: number;
}
