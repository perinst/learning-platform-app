import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

/**
 * Health Routes
 * /health, /api/status
 */
export function createHealthRoutes(): Router {
    const router = Router();
    const healthController = new HealthController();

    // GET /health - Basic health check (no auth required)
    router.get('/health', healthController.healthCheck);

    // GET /api/status - Detailed system status
    router.get('/api/status', healthController.systemStatus);

    return router;
}
