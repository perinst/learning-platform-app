import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { LessonService } from '../services/lesson.service';
import adminMiddleware from '../middleware/admin.middleware';
import authMiddleware from '../middleware/auth.middleware';

/**
 * Lesson Routes
 * /api/lessons/*
 */
export function createLessonRoutes(postgrestUrl: string): Router {
    const router = Router();
    const lessonService = new LessonService(postgrestUrl);
    const lessonController = new LessonController(lessonService);

    router.use(authMiddleware);

    router.get('/', lessonController.getAllLessons);

    router.get('/:id', lessonController.getLessonById);

    router.use(adminMiddleware);

    router.post('/', lessonController.createLesson);

    router.put('/:id', lessonController.updateLesson);

    router.delete('/:id', lessonController.deleteLesson);

    return router;
}
