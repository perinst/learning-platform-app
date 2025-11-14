/**
 * Lesson Entity
 */
export interface Lesson {
    lesson_id: number;
    title: string;
    description?: string;
    content: string;
    level?: string;
    order_index?: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Lesson with Content (detailed view)
 */
export interface LessonWithContent extends Lesson {
    sections?: LessonSection[];
    prerequisites?: number[];
    tags?: string[];
}

/**
 * Lesson Section
 */
export interface LessonSection {
    section_id: number;
    lesson_id: number;
    title: string;
    content: string;
    order_index: number;
    type: 'text' | 'video' | 'quiz' | 'exercise';
}

/**
 * Create Lesson DTO
 */
export interface CreateLessonDto {
    title: string;
    description?: string;
    content: string;
    level?: string;
    order_index?: number;
    is_published?: boolean;
    sections?: Omit<LessonSection, 'section_id' | 'lesson_id'>[];
    prerequisites?: number[];
    tags?: string[];
}

/**
 * Update Lesson DTO
 */
export interface UpdateLessonDto {
    title?: string;
    description?: string;
    content?: string;
    level?: string;
    order_index?: number;
    is_published?: boolean;
    sections?: LessonSection[];
    prerequisites?: number[];
    tags?: string[];
}

/**
 * Lesson Filter Options
 */
export interface LessonFilterOptions {
    level?: string;
    is_published?: boolean;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}
