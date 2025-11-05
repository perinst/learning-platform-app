import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import type {
    AccessToken,
    LoginRequest,
    RegisterRequest,
    DeleteLessonRequest,
    Lesson as BackendLesson,
} from '../types/api.types';
import type { User, Lesson, Progress } from '../utils/mockData';
import { toFrontendLesson, toBackendApplication, toBackendQuestion } from '../utils/apiConverters';

// API Response types (snake_case from backend)
interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    created_at: string;
}

interface ProgressResponse {
    user_id: string;
    lesson_id: number;
    progress: number;
    completed: boolean;
    last_accessed: string;
}

interface RegisterResponse {
    user_id: string;
    user_email: string;
    user_name: string;
    user_role: 'admin' | 'user';
    user_created_at: string;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Helper function to handle API errors
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
};

// Auth API
export const authApi = {
    getCurrentUser: async (): Promise<User | null> => {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (!userData) return null;

        const user = JSON.parse(userData);
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        // Verify token is still valid by making a simple authenticated request
        if (token) {
            try {
                const response = await fetch(`${API_CONFIG.baseURL}/users?id=eq.${user.id}`, {
                    headers: getAuthHeaders(),
                });

                if (response.ok) {
                    const users = await response.json();
                    if (users.length > 0) {
                        return {
                            id: users[0].id,
                            email: users[0].email,
                            name: users[0].name,
                            role: users[0].role,
                            createdAt: new Date(users[0].created_at),
                        };
                    }
                }
            } catch (error) {
                console.error('Failed to verify user session:', error);
            }
        }

        // Clear invalid session
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        return null;
    },

    login: async (email: string, password: string): Promise<User> => {
        const response = await fetch(`${API_CONFIG.baseURL}/rpc/verify_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                p_email: email,
                p_password: password,
            } as LoginRequest),
        });

        const data = await handleResponse<AccessToken[]>(response);

        if (!data || data.length === 0) {
            throw new Error('Invalid email or password');
        }

        const tokenData = data[0];

        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.access_token);

        const user: User = {
            id: tokenData.user_id,
            email: tokenData.user_email,
            name: tokenData.user_name,
            role: tokenData.user_role,
            createdAt: new Date(tokenData.user_created_at),
        };

        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        return user;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },

    register: async (email: string, password: string, name: string): Promise<User> => {
        const response = await fetch(`${API_CONFIG.baseURL}/rpc/register_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                p_email: email,
                p_password: password,
                p_name: name,
                p_role: 'user',
            } as RegisterRequest),
        });

        const data = await handleResponse<RegisterResponse[]>(response);

        if (!data || data.length === 0) {
            throw new Error('Registration failed');
        }

        return {
            id: data[0].user_id,
            email: data[0].user_email,
            name: data[0].user_name,
            role: data[0].user_role,
            createdAt: new Date(data[0].user_created_at),
        };
    },

    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_CONFIG.baseURL}/users`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse<UserResponse[]>(response);

        return data.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: new Date(u.created_at),
        }));
    },
};

// Lessons API
export const lessonsApi = {
    getLessons: async (): Promise<Lesson[]> => {
        const response = await fetch(`${API_CONFIG.baseURL}/rpc/get_all_lessons_with_content`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await handleResponse<BackendLesson[]>(response);
        return data.map(toFrontendLesson);
    },

    getLesson: async (id: string | number): Promise<Lesson> => {
        const response = await fetch(`${API_CONFIG.baseURL}/rpc/get_lesson_with_content`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                p_lesson_id: id,
            }),
        });

        const data = await handleResponse<BackendLesson[]>(response);

        if (!data || data.length === 0) {
            throw new Error('Lesson not found');
        }

        return toFrontendLesson(data[0]);
    },

    createLesson: async (data: Omit<Lesson, 'id' | 'createdAt' | 'createdBy'>): Promise<Lesson> => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_CONFIG.baseURL}/rpc/create_lesson_with_content`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                p_token: token,
                p_title: data.title,
                p_description: data.description,
                p_content: data.content,
                p_category: data.category,
                p_status: data.status,
                p_summary: data.summary,
                p_image_url: data.imageUrl,
                p_applications: (data.applications || []).map(toBackendApplication),
                p_questions: (data.questions || []).map(toBackendQuestion),
            }),
        });

        const result = await handleResponse<{ new_lesson_id: number }[]>(response);

        if (!result || result.length === 0) {
            throw new Error('Failed to create lesson');
        }

        // Fetch the created lesson with all content
        return lessonsApi.getLesson(result[0].new_lesson_id);
    },

    updateLesson: async (id: string | number, data: Partial<Lesson>): Promise<Lesson> => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            throw new Error('Authentication required');
        }

        // Get current lesson to merge with updates
        const currentLesson = await lessonsApi.getLesson(id);
        const updatedLesson = { ...currentLesson, ...data };

        const response = await fetch(`${API_CONFIG.baseURL}/rpc/update_lesson_with_content`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                p_token: token,
                p_lesson_id: id,
                p_title: updatedLesson.title,
                p_description: updatedLesson.description,
                p_content: updatedLesson.content,
                p_category: updatedLesson.category,
                p_status: updatedLesson.status,
                p_summary: updatedLesson.summary,
                p_image_url: updatedLesson.imageUrl,
                p_applications: (updatedLesson.applications || []).map(toBackendApplication),
                p_questions: (updatedLesson.questions || []).map(toBackendQuestion),
            }),
        });

        await handleResponse<{ updated_lesson_id: number }[]>(response);

        // Fetch the updated lesson with all content
        return lessonsApi.getLesson(id);
    },

    deleteLesson: async (id: string | number): Promise<void> => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_CONFIG.baseURL}/rpc/delete_lesson`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                p_token: token,
                p_lesson_id: id,
            } as DeleteLessonRequest),
        });

        await handleResponse<boolean>(response);
    },
};

// Progress API
export const progressApi = {
    getProgress: async (): Promise<Progress[]> => {
        const response = await fetch(`${API_CONFIG.baseURL}/progress`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse<ProgressResponse[]>(response);

        return data.map((p) => ({
            userId: p.user_id,
            lessonId: p.lesson_id,
            progress: p.progress,
            completed: p.completed,
            lastAccessed: new Date(p.last_accessed),
        }));
    },

    getUserProgress: async (userId: string): Promise<Progress[]> => {
        const response = await fetch(`${API_CONFIG.baseURL}/progress?user_id=eq.${userId}`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse<ProgressResponse[]>(response);

        return data.map((p) => ({
            userId: p.user_id,
            lessonId: p.lesson_id,
            progress: p.progress,
            completed: p.completed,
            lastAccessed: new Date(p.last_accessed),
        }));
    },

    getLessonProgress: async (userId: string, lessonId: string | number): Promise<Progress | undefined> => {
        const response = await fetch(`${API_CONFIG.baseURL}/progress?user_id=eq.${userId}&lesson_id=eq.${lessonId}`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse<ProgressResponse[]>(response);

        if (!data || data.length === 0) {
            return undefined;
        }

        const p = data[0];

        return {
            userId: p.user_id,
            lessonId: p.lesson_id,
            progress: p.progress,
            completed: p.completed,
            lastAccessed: new Date(p.last_accessed),
        };
    },

    updateProgress: async (
        userId: string,
        lessonId: string | number,
        progressValue: number,
        completed: boolean
    ): Promise<Progress | undefined> => {
        // Use upsert (POST with merge-duplicates preference)
        try {
            await fetch(`${API_CONFIG.baseURL}/progress`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    Prefer: 'resolution=merge-duplicates',
                },
                body: JSON.stringify({
                    user_id: userId,
                    lesson_id: lessonId,
                    progress: progressValue,
                    completed,
                    last_accessed: new Date().toISOString(),
                }),
            });

            const progressData = await progressApi.getLessonProgress(userId, lessonId);

            return progressData;
        } catch {
            throw new Error('Failed to update progress');
        }
    },

    markLessonAccessed: async (userId: string, lessonId: string | number): Promise<Progress | undefined> => {
        try {
            const existingProgress = await progressApi.getLessonProgress(userId, lessonId);

            await fetch(`${API_CONFIG.baseURL}/progress`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    Prefer: 'resolution=merge-duplicates',
                },
                body: JSON.stringify({
                    user_id: userId,
                    lesson_id: lessonId,
                    progress: existingProgress?.progress ?? 0,
                    completed: existingProgress?.completed ?? false,
                    last_accessed: new Date().toISOString(),
                }),
            });

            const progressData = await progressApi.getLessonProgress(userId, lessonId);

            return progressData;
        } catch {
            throw new Error('Failed to mark lesson as accessed');
        }
    },

    deleteProgressByLessonId: async (): Promise<void> => {
        // This is handled by CASCADE delete in the database when lesson is deleted
        // No need to explicitly delete progress entries
    },
};
