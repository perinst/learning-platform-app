import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { Pool } from 'pg';

/**
 * Auth Routes
 * /api/auth/*
 */
export function createAuthRoutes(pool: Pool, postgrestUrl: string): Router {
    const router = Router();
    const authService = new AuthService(pool, postgrestUrl);
    const authController = new AuthController(authService);

    router.post('/login', authController.login);

    router.post('/register', authController.register);

    router.post('/verify', authController.verifyToken);

    router.post('/logout', authController.logout);

    return router;
}
