import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to intercept GET requests to /lessons and redirect to filtered function
 * This ensures users can only see content they have access to
 */
const lessonAccessMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    // Only intercept GET requests to lessons for non-admin users
    if (req.method === 'GET' && req.path.match(/^\/lessons/)) {
        // Admins can access directly
        if (user?.role === 'admin') {
            return next();
        }

        // For regular users, check if they're requesting a specific lesson
        const lessonIdMatch = req.path.match(/^\/lessons\/(\d+)$/);

        if (lessonIdMatch) {
            // Redirect to get_lesson_by_id function
            const lessonId = lessonIdMatch[1];
            req.url = `/rpc/get_lesson_by_id?p_user_id=${user?.user_id}&p_lesson_id=${lessonId}`;
            console.log(`[LESSON-ACCESS] Redirecting to filtered function: ${req.url}`);
            return next();
        } else if (req.path === '/lessons') {
            // Redirect to get_lessons_for_user function
            req.url = `/rpc/get_lessons_for_user?p_user_id=${user?.user_id}`;
            console.log(`[LESSON-ACCESS] Redirecting to filtered function: ${req.url}`);
            return next();
        }
    }

    next();
};

export default lessonAccessMiddleware;
