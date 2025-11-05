import { Request, Response, NextFunction } from 'express';
import { verifyToken, isAdmin } from '../services/auth.service';

// Extend Express Request type to include user (ES2015 module augmentation)
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            user_id: string;
            email: string;
            name: string;
            role: string;
            token_expires_at: string;
        };
    }
}

/**
 * Authentication Middleware
 * Verifies Bearer token and attaches user info to request
 */
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid Authorization header. Use: Bearer <token>',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token with PostgreSQL
        const user = await verifyToken(token);

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
            });
        }

        // Attach user to request object
        req.user = user;

        // RBAC: Check if route requires admin access
        if (isAdminRoute(req.method, req.path)) {
            const userIsAdmin = user.role === 'admin';

            if (!userIsAdmin) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Admin access required for this operation',
                });
            }
        }

        // Log successful authentication
        console.log(`✓ Authenticated: ${user.email} (${user.role})`);

        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        console.error('Auth Error:', errorMessage);
        return res.status(401).json({
            error: 'Unauthorized',
            message: errorMessage,
        });
    }
};

/**
 * RBAC: Determine if route requires admin access
 */
function isAdminRoute(method: string, path: string): boolean {
    // Admin-only routes
    const adminRoutes = [
        // Creating lessons
        { method: 'POST', pattern: /^\/rpc\/create_lesson/ },

        // Updating lessons
        { method: 'POST', pattern: /^\/rpc\/update_lesson/ },

        // Deleting lessons
        { method: 'POST', pattern: /^\/rpc\/delete_lesson/ },

        // Direct table modifications (if allowed)
        { method: 'POST', pattern: /^\/lessons$/ },
        { method: 'PATCH', pattern: /^\/lessons/ },
        { method: 'DELETE', pattern: /^\/lessons/ },

        // User management
        { method: 'POST', pattern: /^\/users$/ },
        { method: 'PATCH', pattern: /^\/users/ },
        { method: 'DELETE', pattern: /^\/users/ },
    ];

    return adminRoutes.some((route) => route.method === method && route.pattern.test(path));
}

export default authMiddleware;
