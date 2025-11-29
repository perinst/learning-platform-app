import { Request, Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Health Controller
 * Handles health check and system status requests
 */
export class HealthController {
    /**
     * GET /health
     * System health check endpoint
     */
    healthCheck = async (req: Request, res: Response): Promise<void> => {
        try {
            res.status(200).json({
                success: true,
                data: {
                    status: 'ok',
                    service: 'Learning Platform API',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                },
            } as ApiResponse);
        } catch (error) {
            console.error('[HealthController] Health check error:', error);
            res.status(500).json({
                success: false,
                error: 'Health check failed',
            } as ApiResponse);
        }
    };

    /**
     * GET /api/status
     * Detailed system status
     */
    systemStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            res.status(200).json({
                success: true,
                data: {
                    status: 'operational',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: {
                        used: process.memoryUsage().heapUsed,
                        total: process.memoryUsage().heapTotal,
                    },
                },
            } as ApiResponse);
        } catch (error) {
            console.error('[HealthController] System status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve system status',
            } as ApiResponse);
        }
    };
}
