# API Development Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Development Guidelines](#development-guidelines)
4. [Adding New Features](#adding-new-features)
5. [Best Practices](#best-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This API follows a **layered architecture** pattern for scalability and maintainability:

```
┌─────────────────────────────────────────┐
│         Client Application              │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│     Routes Layer (HTTP Endpoints)       │
│   - Route definitions                   │
│   - Request validation                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Controllers (Request Handlers)       │
│   - Request/Response handling           │
│   - Input validation                    │
│   - Response formatting                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Services (Business Logic)            │
│   - Core business logic                 │
│   - Data transformation                 │
│   - External API calls                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Database / PostgREST Layer           │
│   - Data persistence                    │
│   - Database operations                 │
└─────────────────────────────────────────┘
```

### Key Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Injection**: Services are injected into controllers
3. **Single Responsibility**: Each module does one thing well
4. **DRY (Don't Repeat Yourself)**: Shared logic in utilities and services
5. **Testability**: Easy to unit test each layer independently

---

## Project Structure

```
api/
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── lesson.controller.ts
│   │   ├── upload.controller.ts
│   │   └── health.controller.ts
│   │
│   ├── services/           # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── lesson.service.ts
│   │   └── upload.service.ts
│   │
│   ├── routes/             # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── lesson.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts        # Main router
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── common.middleware.ts
│   │   └── lesson-access.middleware.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── lesson.types.ts
│   │
│   ├── config/             # Configuration files
│   │   ├── app.config.ts
│   │   ├── cors.config.ts
│   │   └── routes.config.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── database.ts
│   │   └── response.helpers.ts
│   │
│   └── index.ts            # Application entry point
│
├── docs/                   # Documentation
│   └── API-DEVELOPMENT-GUIDE.md (this file)
│
├── package.json
├── tsconfig.json
└── .env                    # Environment variables
```

---

## Development Guidelines

### 1. Adding a New Endpoint

Follow this systematic approach:

#### Step 1: Define Types (`types/`)

Create or update type definitions for your feature:

```typescript
// types/resource.types.ts
export interface Resource {
    id: number;
    name: string;
    description?: string;
    created_at: string;
}

export interface CreateResourceDto {
    name: string;
    description?: string;
}

export interface UpdateResourceDto {
    name?: string;
    description?: string;
}
```

#### Step 2: Create Service (`services/`)

Implement business logic:

```typescript
// services/resource.service.ts
import { Resource, CreateResourceDto, UpdateResourceDto } from '../types/resource.types';

export class ResourceService {
    private postgrestUrl: string;

    constructor(postgrestUrl: string) {
        this.postgrestUrl = postgrestUrl;
    }

    async getAllResources(): Promise<Resource[]> {
        try {
            const response = await fetch(`${this.postgrestUrl}/resources`);
            if (!response.ok) throw new Error('Failed to fetch resources');
            return await response.json();
        } catch (error) {
            console.error('[ResourceService] Get all error:', error);
            throw error;
        }
    }

    async getResourceById(id: number): Promise<Resource | null> {
        try {
            const response = await fetch(`${this.postgrestUrl}/resources?id=eq.${id}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('[ResourceService] Get by ID error:', error);
            throw error;
        }
    }

    async createResource(data: CreateResourceDto): Promise<Resource> {
        try {
            const response = await fetch(`${this.postgrestUrl}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create resource');
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('[ResourceService] Create error:', error);
            throw error;
        }
    }

    async updateResource(id: number, data: UpdateResourceDto): Promise<Resource | null> {
        try {
            const response = await fetch(`${this.postgrestUrl}/resources?id=eq.${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) return null;
            const result = await response.json();
            return result[0] || null;
        } catch (error) {
            console.error('[ResourceService] Update error:', error);
            throw error;
        }
    }

    async deleteResource(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.postgrestUrl}/resources?id=eq.${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('[ResourceService] Delete error:', error);
            throw error;
        }
    }
}
```

#### Step 3: Create Controller (`controllers/`)

Handle HTTP requests and responses:

```typescript
// controllers/resource.controller.ts
import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';
import { ApiResponse } from '../types/api.types';
import { CreateResourceDto, UpdateResourceDto } from '../types/resource.types';

export class ResourceController {
    private resourceService: ResourceService;

    constructor(resourceService: ResourceService) {
        this.resourceService = resourceService;
    }

    getAllResources = async (req: Request, res: Response): Promise<void> => {
        try {
            const resources = await this.resourceService.getAllResources();
            res.status(200).json({
                success: true,
                data: resources,
            } as ApiResponse);
        } catch (error) {
            console.error('[ResourceController] Get all error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch resources',
            } as ApiResponse);
        }
    };

    getResourceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid resource ID',
                } as ApiResponse);
                return;
            }

            const resource = await this.resourceService.getResourceById(id);
            if (!resource) {
                res.status(404).json({
                    success: false,
                    error: 'Resource not found',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: resource,
            } as ApiResponse);
        } catch (error) {
            console.error('[ResourceController] Get by ID error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch resource',
            } as ApiResponse);
        }
    };

    createResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const data: CreateResourceDto = req.body;

            // Validation
            if (!data.name) {
                res.status(400).json({
                    success: false,
                    error: 'Name is required',
                } as ApiResponse);
                return;
            }

            const newResource = await this.resourceService.createResource(data);
            res.status(201).json({
                success: true,
                data: newResource,
                message: 'Resource created successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[ResourceController] Create error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create resource',
            } as ApiResponse);
        }
    };

    updateResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const data: UpdateResourceDto = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid resource ID',
                } as ApiResponse);
                return;
            }

            const updatedResource = await this.resourceService.updateResource(id, data);
            if (!updatedResource) {
                res.status(404).json({
                    success: false,
                    error: 'Resource not found',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: updatedResource,
                message: 'Resource updated successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[ResourceController] Update error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update resource',
            } as ApiResponse);
        }
    };

    deleteResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid resource ID',
                } as ApiResponse);
                return;
            }

            const deleted = await this.resourceService.deleteResource(id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'Resource not found',
                } as ApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Resource deleted successfully',
            } as ApiResponse);
        } catch (error) {
            console.error('[ResourceController] Delete error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete resource',
            } as ApiResponse);
        }
    };
}
```

#### Step 4: Create Routes (`routes/`)

Define HTTP endpoints:

```typescript
// routes/resource.routes.ts
import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { ResourceService } from '../services/resource.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

export function createResourceRoutes(postgrestUrl: string): Router {
    const router = Router();
    const resourceService = new ResourceService(postgrestUrl);
    const resourceController = new ResourceController(resourceService);

    // Public routes (if any)
    router.get('/', resourceController.getAllResources);
    router.get('/:id', resourceController.getResourceById);

    // Protected routes
    router.use(authMiddleware);
    router.post('/', adminMiddleware, resourceController.createResource);
    router.put('/:id', adminMiddleware, resourceController.updateResource);
    router.delete('/:id', adminMiddleware, resourceController.deleteResource);

    return router;
}
```

#### Step 5: Register Routes (`routes/index.ts`)

Add your routes to the main router:

```typescript
import { createResourceRoutes } from './resource.routes';

// In createRouter function:
router.use('/api/resources', createResourceRoutes(postgrestUrl));
```

---

## Best Practices

### 1. Error Handling

Always handle errors consistently:

```typescript
try {
    const result = await service.doSomething();
    res.status(200).json({ success: true, data: result });
} catch (error) {
    console.error('[Controller] Error:', error);
    res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
    });
}
```

### 2. Type Safety

Use TypeScript types everywhere:

```typescript
// ✅ Good
async function getUser(id: number): Promise<User | null> {
    // Implementation
}

// ❌ Bad
async function getUser(id: any): Promise<any> {
    // Implementation
}
```

### 3. Validation

Validate input at the controller level:

```typescript
if (!data.email || !isValidEmail(data.email)) {
    res.status(400).json({
        success: false,
        error: 'Invalid email address',
    });
    return;
}
```

### 4. Logging

Use consistent logging patterns:

```typescript
// Service layer
console.log('[ServiceName] Operation started');
console.error('[ServiceName] Error:', error);

// Controller layer
console.log('[ControllerName] Request:', req.method, req.path);
```

### 5. Response Format

Use standardized response format:

```typescript
// Success
{
    "success": true,
    "data": { /* payload */ },
    "message": "Optional success message"
}

// Error
{
    "success": false,
    "error": "Error message",
    "details": { /* optional details */ }
}
```

### 6. Security

-   **Authentication**: Always use `authMiddleware` for protected routes
-   **Authorization**: Use `adminMiddleware` for admin-only operations
-   **Input Sanitization**: Validate and sanitize all user inputs
-   **Rate Limiting**: Implement rate limiting for public endpoints
-   **CORS**: Configure CORS properly for allowed origins

### 7. Database Access

-   Use connection pooling (already configured in `utils/database.ts`)
-   Always release database clients
-   Handle connection errors gracefully
-   Use transactions for multi-step operations

```typescript
const client = await pool.connect();
try {
    await client.query('BEGIN');
    // Multiple operations
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

---

## Testing Guidelines

### Unit Testing

Test services independently:

```typescript
// services/resource.service.test.ts
describe('ResourceService', () => {
    let service: ResourceService;

    beforeEach(() => {
        service = new ResourceService('http://mock-url');
    });

    it('should fetch all resources', async () => {
        const resources = await service.getAllResources();
        expect(resources).toBeDefined();
    });
});
```

### Integration Testing

Test controllers with mocked services:

```typescript
// controllers/resource.controller.test.ts
describe('ResourceController', () => {
    let controller: ResourceController;
    let mockService: jest.Mocked<ResourceService>;

    beforeEach(() => {
        mockService = {
            getAllResources: jest.fn(),
            getResourceById: jest.fn(),
        } as any;
        controller = new ResourceController(mockService);
    });

    it('should return all resources', async () => {
        mockService.getAllResources.mockResolvedValue([]);
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await controller.getAllResources(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

    - Check PostgreSQL is running
    - Verify `.env` database credentials
    - Check network connectivity

2. **PostgREST Connection Errors**

    - Ensure PostgREST is running on correct port
    - Check `POSTGREST_URL` in `.env`
    - Verify PostgREST configuration

3. **Authentication Failures**

    - Check token format (Bearer <token>)
    - Verify token hasn't expired
    - Confirm database has `verify_token` function

4. **CORS Errors**
    - Add origin to `allowedOrigins` in `cors.config.ts`
    - Check preflight OPTIONS requests
    - Verify headers are included in CORS config

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development npm run dev
```

---

## Additional Resources

-   [Express.js Documentation](https://expressjs.com/)
-   [TypeScript Documentation](https://www.typescriptlang.org/)
-   [PostgreSQL Documentation](https://www.postgresql.org/docs/)
-   [PostgREST Documentation](https://postgrest.org/)

---

## Support

For questions or issues:

1. Check this documentation first
2. Review existing code examples
3. Consult team lead or senior developer
4. Create an issue in the project repository

---

**Last Updated**: November 14, 2025
