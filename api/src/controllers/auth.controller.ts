import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';

/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */
export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Authenticate user and return token
     */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Email and password are required',
                } as ApiResponse);
                return;
            }

            const result = await this.authService.login(email, password);

            if (!result.success) {
                res.status(401).json(result);
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            console.error('[AuthController] Login error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Login failed',
            } as ApiResponse);
        }
    };

    /**
     * POST /api/auth/register
     * Register a new user
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                res.status(400).json({
                    success: false,
                    error: 'Email, password, and name are required',
                } as ApiResponse);
                return;
            }

            const result = await this.authService.register(email, password, name);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.status(201).json(result);
        } catch (error) {
            console.error('[AuthController] Registration error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed',
            } as ApiResponse);
        }
    };

    /**
     * POST /api/auth/verify
     * Verify token validity
     */
    verifyToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({
                    success: false,
                    error: 'No token provided',
                } as ApiResponse);
                return;
            }

            const user = await this.authService.verifyToken(token);

            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: user,
            } as ApiResponse);
        } catch (error) {
            console.error('[AuthController] Token verification error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Token verification failed',
            } as ApiResponse);
        }
    };

    /**
     * POST /api/auth/logout
     * Logout user (invalidate token if needed)
     */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            // In a stateless JWT setup, logout is handled client-side
            // If you need server-side token invalidation, implement it here
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[AuthController] Logout error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Logout failed',
            } as ApiResponse);
        }
    };
}
