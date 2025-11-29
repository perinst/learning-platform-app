import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';

/**
 * Error Middleware
 * Handles errors throughout the application
 */
export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('[ErrorMiddleware] Error:', error);

    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        ...(isDevelopment && { stack: error.stack }),
    } as ApiResponse);
};

/**
 * Not Found Middleware
 * Handles 404 errors
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    } as ApiResponse);
};

/**
 * Request Logger Middleware
 * Logs all incoming requests
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

/**
 * Validation Middleware Factory
 * Creates middleware for request validation
 */
export function validateRequest(schema: {
    body?: (data: any) => boolean;
    params?: (data: any) => boolean;
    query?: (data: any) => boolean;
}) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (schema.body && !schema.body(req.body)) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid request body',
                } as ApiResponse);
                return;
            }

            if (schema.params && !schema.params(req.params)) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid request parameters',
                } as ApiResponse);
                return;
            }

            if (schema.query && !schema.query(req.query)) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid query parameters',
                } as ApiResponse);
                return;
            }

            next();
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: error instanceof Error ? error.message : 'Validation failed',
            } as ApiResponse);
        }
    };
}
