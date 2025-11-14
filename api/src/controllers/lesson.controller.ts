import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CreateLessonDto, UpdateLessonDto } from '../types';
import { LessonService } from '../services/lesson.service';

/**
 * Lesson Controller
 * Handles lesson-related HTTP requests
 */
export class LessonController {
    private lessonService: LessonService;

    constructor(lessonService: LessonService) {
        this.lessonService = lessonService;
    }

    /**
     * GET /api/lessons
     * Get all lessons (filtered by user access)
     */
    getAllLessons = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.user_id;
            const userRole = req.user?.role;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                } as ApiResponse);
                return;
            }

            const lessons = await this.lessonService.getAllLessons(userId, userRole);

            res.status(200).json({
                success: true,
                data: lessons,
            } as ApiResponse);
        } catch (error) {
            console.error('[LessonController] Get all lessons error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lessons',
            } as ApiResponse);
        }
    };

    /**
     * GET /api/lessons/:id
     * Get a specific lesson by ID
     */
    getLessonById = async (req: Request, res: Response): Promise<void> => {
        try {
            const lessonId = parseInt(req.params.id);
            const userId = req.user?.user_id;
            const userRole = req.user?.role;

            if (isNaN(lessonId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid lesson ID',
                } as ApiResponse);
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                } as ApiResponse);
                return;
            }

            const lesson = await this.lessonService.getLessonById(lessonId, userId, userRole);

            if (!lesson) {
                res.status(404).json({
                    success: false,
                    error: 'Lesson not found or access denied',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: lesson,
            } as ApiResponse);
        } catch (error) {
            console.error('[LessonController] Get lesson by ID error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch lesson',
            } as ApiResponse);
        }
    };

    /**
     * POST /api/lessons
     * Create a new lesson (Admin only)
     */
    createLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const lessonData: CreateLessonDto = req.body;

            // Validation
            if (!lessonData.title || !lessonData.content) {
                res.status(400).json({
                    success: false,
                    error: 'Title and content are required',
                } as ApiResponse);
                return;
            }

            const newLesson = await this.lessonService.createLesson(lessonData);

            res.status(201).json({
                success: true,
                data: newLesson,
                message: 'Lesson created successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[LessonController] Create lesson error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create lesson',
            } as ApiResponse);
        }
    };

    /**
     * PUT /api/lessons/:id
     * Update an existing lesson (Admin only)
     */
    updateLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const lessonId = parseInt(req.params.id);
            const lessonData: UpdateLessonDto = req.body;

            if (isNaN(lessonId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid lesson ID',
                } as ApiResponse);
                return;
            }

            const updatedLesson = await this.lessonService.updateLesson(lessonId, lessonData);

            if (!updatedLesson) {
                res.status(404).json({
                    success: false,
                    error: 'Lesson not found',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: updatedLesson,
                message: 'Lesson updated successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[LessonController] Update lesson error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update lesson',
            } as ApiResponse);
        }
    };

    /**
     * DELETE /api/lessons/:id
     * Delete a lesson (Admin only)
     */
    deleteLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const lessonId = parseInt(req.params.id);

            if (isNaN(lessonId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid lesson ID',
                } as ApiResponse);
                return;
            }

            const deleted = await this.lessonService.deleteLesson(lessonId);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'Lesson not found',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Lesson deleted successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[LessonController] Delete lesson error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete lesson',
            } as ApiResponse);
        }
    };
}
