// Utility functions to convert between backend (snake_case) and frontend (camelCase) formats

import type {
    User as BackendUser,
    Lesson as BackendLesson,
    Progress as BackendProgress,
    LessonApplication as BackendLessonApplication,
    LessonQuestion as BackendLessonQuestion,
    QuestionChoice as BackendQuestionChoice,
} from '../types/api.types';
import type { User, Lesson, Progress, LessonApplication, LessonQuestion, QuestionChoice } from '../utils/mockData';

// Convert backend User to frontend User
export function toFrontendUser(backendUser: BackendUser): User {
    return {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
        createdAt: new Date(backendUser.created_at),
    };
}

// Convert backend QuestionChoice to frontend QuestionChoice
export function toFrontendChoice(backendChoice: BackendQuestionChoice): QuestionChoice {
    return {
        id: backendChoice.id,
        choiceText: backendChoice.choice_text,
        isCorrect: backendChoice.is_correct,
        displayOrder: backendChoice.display_order,
    };
}

// Convert backend LessonQuestion to frontend LessonQuestion
export function toFrontendQuestion(backendQuestion: BackendLessonQuestion): LessonQuestion {
    return {
        id: backendQuestion.id,
        questionText: backendQuestion.question_text,
        displayOrder: backendQuestion.display_order,
        choices: backendQuestion.choices?.map(toFrontendChoice) || [],
    };
}

// Convert backend LessonApplication to frontend LessonApplication
export function toFrontendApplication(backendApp: BackendLessonApplication): LessonApplication {
    return {
        id: backendApp.id,
        title: backendApp.title,
        description: backendApp.description,
        displayOrder: backendApp.display_order,
    };
}

// Convert backend Lesson to frontend Lesson
export function toFrontendLesson(backendLesson: BackendLesson): Lesson {
    return {
        id: backendLesson.id,
        title: backendLesson.title,
        description: backendLesson.description,
        content: backendLesson.content,
        category: backendLesson.category,
        status: backendLesson.status,
        imageUrl: backendLesson.image_url,
        summary: backendLesson.summary,
        createdAt: new Date(backendLesson.created_at),
        createdBy: backendLesson.created_by,
        applications: backendLesson.applications?.map(toFrontendApplication) || [],
        questions: backendLesson.questions?.map(toFrontendQuestion) || [],
    };
}

// Convert backend Progress to frontend Progress
export function toFrontendProgress(backendProgress: BackendProgress): Progress {
    return {
        userId: backendProgress.user_id,
        lessonId: backendProgress.lesson_id,
        progress: backendProgress.progress,
        completed: backendProgress.completed,
        lastAccessed: new Date(backendProgress.last_accessed),
    };
}

// =====================================================
// BACKEND CONVERTERS (Frontend → Backend)
// =====================================================

// Convert frontend QuestionChoice to backend QuestionChoice
export function toBackendChoice(frontendChoice: QuestionChoice): BackendQuestionChoice {
    const backendChoice: BackendQuestionChoice = {
        choice_text: frontendChoice.choiceText,
        is_correct: frontendChoice.isCorrect,
        display_order: frontendChoice.displayOrder,
    };

    // Only include id if it exists
    if (frontendChoice.id !== undefined) {
        backendChoice.id = frontendChoice.id;
    }

    return backendChoice;
}

// Convert frontend LessonQuestion to backend LessonQuestion
export function toBackendQuestion(frontendQuestion: LessonQuestion): BackendLessonQuestion {
    const backendQuestion: BackendLessonQuestion = {
        question_text: frontendQuestion.questionText,
        display_order: frontendQuestion.displayOrder,
        choices: frontendQuestion.choices?.map(toBackendChoice) || [],
    };

    // Only include id if it exists
    if (frontendQuestion.id !== undefined) {
        backendQuestion.id = frontendQuestion.id;
    }

    return backendQuestion;
}

// Convert frontend LessonApplication to backend LessonApplication
export function toBackendApplication(frontendApp: LessonApplication): BackendLessonApplication {
    const backendApp: BackendLessonApplication = {
        title: frontendApp.title,
        description: frontendApp.description,
        display_order: frontendApp.displayOrder,
    };

    // Only include id if it exists
    if (frontendApp.id !== undefined) {
        backendApp.id = frontendApp.id;
    }

    return backendApp;
}
