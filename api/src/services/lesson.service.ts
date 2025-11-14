import {
    Lesson,
    LessonWithContent,
    CreateLessonDto,
    UpdateLessonDto,
    LessonFilterOptions,
} from '../types/lesson.types';

/**
 * Lesson Service
 * Handles lesson-related business logic
 */
export class LessonService {
    private postgrestUrl: string;

    constructor(postgrestUrl: string) {
        this.postgrestUrl = postgrestUrl;
    }

    /**
     * Get all lessons (filtered by user access)
     */
    async getAllLessons(userId: string, userRole?: string): Promise<LessonWithContent[]> {
        try {
            const endpoint =
                userRole === 'admin'
                    ? `${this.postgrestUrl}/rpc/get_all_lessons_with_content`
                    : `${this.postgrestUrl}/rpc/get_all_lessons_with_content`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_user_id: userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lessons');
            }

            const data = (await response.json()) as LessonWithContent[];

            if (!data || !Array.isArray(data)) {
                return [];
            }

            return data;
        } catch (error) {
            console.error('[LessonService] Get all lessons error:', error);
            throw error;
        }
    }

    /**
     * Get lesson by ID
     */
    async getLessonById(lessonId: number, userId: string, userRole?: string): Promise<LessonWithContent | null> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/get_lesson_with_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_lesson_id: lessonId, p_user_id: userId }),
            });

            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as LessonWithContent[];
            return data?.[0] || null;
        } catch (error) {
            console.error('[LessonService] Get lesson by ID error:', error);
            throw error;
        }
    }

    /**
     * Create a new lesson
     */
    async createLesson(lessonData: CreateLessonDto): Promise<Lesson> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/create_lesson_with_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    p_title: lessonData.title,
                    p_description: lessonData.description,
                    p_content: lessonData.content,
                    p_level: lessonData.level,
                    p_order_index: lessonData.order_index,
                    p_is_published: lessonData.is_published ?? false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create lesson');
            }

            const data = (await response.json()) as Lesson[];
            return data[0];
        } catch (error) {
            console.error('[LessonService] Create lesson error:', error);
            throw error;
        }
    }

    /**
     * Update an existing lesson
     */
    async updateLesson(lessonId: number, lessonData: UpdateLessonDto): Promise<Lesson | null> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/update_lesson_with_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    p_lesson_id: lessonId,
                    p_title: lessonData.title,
                    p_description: lessonData.description,
                    p_content: lessonData.content,
                    p_level: lessonData.level,
                    p_order_index: lessonData.order_index,
                    p_is_published: lessonData.is_published,
                }),
            });

            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as Lesson[];
            return data[0] || null;
        } catch (error) {
            console.error('[LessonService] Update lesson error:', error);
            throw error;
        }
    }

    /**
     * Delete a lesson
     */
    async deleteLesson(lessonId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.postgrestUrl}/rpc/delete_lesson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_lesson_id: lessonId }),
            });

            return response.ok;
        } catch (error) {
            console.error('[LessonService] Delete lesson error:', error);
            throw error;
        }
    }

    /**
     * Search lessons
     */
    async searchLessons(userId: string, filters: LessonFilterOptions): Promise<LessonWithContent[]> {
        try {
            // This would call a custom PostgreSQL function
            // For now, we'll use the basic get all and filter client-side
            const lessons = await this.getAllLessons(userId);

            let filtered = lessons;

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(
                    (lesson) =>
                        lesson.title.toLowerCase().includes(searchLower) ||
                        lesson.description?.toLowerCase().includes(searchLower)
                );
            }

            if (filters.level) {
                filtered = filtered.filter((lesson) => lesson.level === filters.level);
            }

            if (filters.is_published !== undefined) {
                filtered = filtered.filter((lesson) => lesson.is_published === filters.is_published);
            }

            return filtered;
        } catch (error) {
            console.error('[LessonService] Search lessons error:', error);
            throw error;
        }
    }
}
