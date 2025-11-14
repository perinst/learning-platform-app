import { Request, Response, NextFunction } from 'express';

/**
 * Admin Middleware
 * Ensures the authenticated user has admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
            return;
        }

        if (user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Admin access required for this operation',
            });
            return;
        }

        console.log(`✓ Admin access granted: ${user.email}`);
        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authorization failed';
        console.error('[AdminMiddleware] Error:', errorMessage);
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: errorMessage,
        });
    }
};

export default adminMiddleware;
