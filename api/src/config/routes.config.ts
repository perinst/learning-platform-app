/**
 * Public routes that don't require authentication
 * These routes will bypass the auth middleware
 */
export const publicRoutes = [
    // User registration
    '/rpc/register_user',

    // User login
    '/rpc/verify_login',

    // Health check already handled separately
];

/**
 * Admin-only routes (handled in auth middleware)
 * Listed here for documentation purposes
 */
export const adminRoutes = [
    // Lesson management
    '/rpc/create_lesson',
    '/rpc/update_lesson',
    '/rpc/delete_lesson',

    // Direct table access
    'POST /lessons',
    'PATCH /lessons/*',
    'DELETE /lessons/*',

    // User management
    'POST /users',
    'PATCH /users/*',
    'DELETE /users/*',
];
