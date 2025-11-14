import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { UploadService } from '../services/upload.service';
import authMiddleware from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

/**
 * Upload Routes
 * /api/upload/*
 */
export function createUploadRoutes(freeImageApiKey: string): Router {
    const router = Router();
    const uploadService = new UploadService(freeImageApiKey);
    const uploadController = new UploadController(uploadService);

    router.use(authMiddleware);
    router.use(adminMiddleware);

    router.post('/image', uploadController.uploadImage);

    return router;
}
