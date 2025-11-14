import { Router } from 'express';
import { Pool } from 'pg';
import { createAuthRoutes } from './auth.routes';
import { createLessonRoutes } from './lesson.routes';
import { createUploadRoutes } from './upload.routes';
import { createHealthRoutes } from './health.routes';

/**
 * Main Router
 * Combines all route modules
 */
export function createRouter(pool: Pool, postgrestUrl: string, freeImageApiKey: string): Router {
    const router = Router();

    // Health routes (no /api prefix)
    router.use(createHealthRoutes());

    // API routes
    router.use('/api/auth', createAuthRoutes(pool, postgrestUrl));
    router.use('/api/lessons', createLessonRoutes(postgrestUrl));
    router.use('/api/upload', createUploadRoutes(freeImageApiKey));

    return router;
}
