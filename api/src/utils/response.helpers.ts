import { ApiResponse, ErrorResponse } from '../types/api.types';

/**
 * Response Helpers
 * Utility functions for standardized API responses
 */

/**
 * Success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        ...(message && { message }),
    };
}

/**
 * Error response
 */
export function errorResponse(error: string, details?: any): ErrorResponse {
    return {
        success: false,
        error,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && details?.stack && { stack: details.stack }),
    };
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number): ApiResponse<T[]> {
    return {
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string): ErrorResponse {
    return {
        success: false,
        error: `${resource} not found`,
    };
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message?: string): ErrorResponse {
    return {
        success: false,
        error: message || 'Unauthorized',
    };
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message?: string): ErrorResponse {
    return {
        success: false,
        error: message || 'Forbidden',
    };
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors: any): ErrorResponse {
    return {
        success: false,
        error: 'Validation Error',
        details: errors,
    };
}
