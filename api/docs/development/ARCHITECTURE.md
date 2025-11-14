# API Architecture Documentation

## Overview

This document describes the restructured API architecture designed for scalability, maintainability, and clean separation of concerns.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                      │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (index.ts)                │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Middleware Chain                                   │   │
│  │  - CORS, Helmet, Body Parser                       │   │
│  │  - Request Logger                                   │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                       ROUTES LAYER                          │
│  /api/auth/*      → Auth Routes                            │
│  /api/lessons/*   → Lesson Routes                          │
│  /api/upload/*    → Upload Routes                          │
│  /health          → Health Check                           │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                         │
│  - Authentication Middleware (authMiddleware)              │
│  - Authorization Middleware (adminMiddleware)              │
│  - Error Handling Middleware                               │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   CONTROLLERS LAYER                         │
│  - AuthController                                          │
│  - LessonController                                        │
│  - UploadController                                        │
│  - HealthController                                        │
│                                                            │
│  Responsibilities:                                         │
│  • HTTP request/response handling                          │
│  • Input validation                                        │
│  • Response formatting                                     │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                           │
│  - AuthService                                             │
│  - LessonService                                           │
│  - UploadService                                           │
│                                                            │
│  Responsibilities:                                         │
│  • Business logic                                          │
│  • Data transformation                                     │
│  • External API calls                                      │
│  • Database operations coordination                        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                          │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │   PostgreSQL     │  ←→    │    PostgREST     │         │
│  │   Database       │        │   REST API       │         │
│  └──────────────────┘        └──────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Routes Layer (`routes/`)

**Purpose**: Define HTTP endpoints and route configuration

**Responsibilities**:

-   Map HTTP methods to controller methods
-   Apply route-specific middleware
-   Group related endpoints
-   Define route parameters

**Example**:

```typescript
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authMiddleware, adminMiddleware, controller.create);
```

### 2. Controllers Layer (`controllers/`)

**Purpose**: Handle HTTP request/response cycle

**Responsibilities**:

-   Parse request data (body, params, query)
-   Validate input data
-   Call appropriate service methods
-   Format responses
-   Handle HTTP-specific errors (400, 401, 404, etc.)

**Key Principles**:

-   No business logic
-   No direct database access
-   Always return proper HTTP status codes
-   Use standardized response format

### 3. Services Layer (`services/`)

**Purpose**: Implement business logic

**Responsibilities**:

-   Core application logic
-   Data validation and transformation
-   Coordinate multiple operations
-   Call external APIs
-   Interact with database

**Key Principles**:

-   Independent of HTTP/Express
-   Reusable across different endpoints
-   Testable in isolation
-   Single Responsibility Principle

### 4. Middleware Layer (`middleware/`)

**Purpose**: Request/Response processing

**Types**:

-   **Authentication**: Verify user identity
-   **Authorization**: Check user permissions
-   **Validation**: Validate request data
-   **Logging**: Log requests/responses
-   **Error Handling**: Catch and format errors

### 5. Types Layer (`types/`)

**Purpose**: TypeScript type definitions

**Contents**:

-   Entity interfaces
-   DTO (Data Transfer Object) interfaces
-   API response types
-   Configuration types

### 6. Config Layer (`config/`)

**Purpose**: Application configuration

**Contents**:

-   Environment variables
-   CORS settings
-   Database configuration
-   External API settings

### 7. Utils Layer (`utils/`)

**Purpose**: Shared utility functions

**Contents**:

-   Database connection manager
-   Response helpers
-   Validation functions
-   Helper utilities

## Design Patterns

### 1. Dependency Injection

Services are injected into controllers:

```typescript
export class LessonController {
    constructor(private lessonService: LessonService) {}
}
```

**Benefits**:

-   Easy to test (mock dependencies)
-   Loose coupling
-   Better maintainability

### 2. Factory Pattern

Routes are created using factory functions:

```typescript
export function createLessonRoutes(postgrestUrl: string): Router {
    const service = new LessonService(postgrestUrl);
    const controller = new LessonController(service);
    // ... route setup
}
```

**Benefits**:

-   Flexible instantiation
-   Configuration at creation time
-   Easy to modify dependencies

### 3. Singleton Pattern

Database connection manager:

```typescript
class DatabaseManager {
    private static instance: DatabaseManager;

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
}
```

**Benefits**:

-   Single database connection pool
-   Resource efficiency
-   Centralized management

### 4. Middleware Chain Pattern

Request processing pipeline:

```typescript
app.use(cors());
app.use(helmet());
app.use(authMiddleware);
app.use(adminMiddleware);
```

**Benefits**:

-   Composable request processing
-   Reusable logic
-   Clear separation of concerns

## Data Flow

### 1. Incoming Request Flow

```
Client Request
    ↓
Express Server
    ↓
Global Middleware (CORS, Security, Logging)
    ↓
Route Matching
    ↓
Route-specific Middleware (Auth, Admin)
    ↓
Controller
    ↓
Service
    ↓
Database/External API
    ↓
Service (transform data)
    ↓
Controller (format response)
    ↓
Client Response
```

### 2. Authentication Flow

```
Client sends request with Bearer token
    ↓
authMiddleware extracts token
    ↓
Query database: verify_token(token)
    ↓
Check token expiration
    ↓
If valid: attach user to req.user
    ↓
If admin required: adminMiddleware checks role
    ↓
Continue to controller
```

### 3. Error Handling Flow

```
Error occurs in Service/Controller
    ↓
Caught by try-catch block
    ↓
Logged to console
    ↓
Formatted as standardized error response
    ↓
Sent to client with appropriate status code
```

## API Response Format

All API responses follow a standard format:

### Success Response

```json
{
    "success": true,
    "data": {
        /* payload */
    },
    "message": "Optional success message"
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "details": {
        /* optional error details */
    }
}
```

### Paginated Response

```json
{
    "success": true,
    "data": [
        /* array of items */
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    }
}
```

## Security Architecture

### 1. Authentication

-   **Method**: Bearer token (JWT-like)
-   **Storage**: PostgreSQL database
-   **Validation**: Custom `verify_token()` function
-   **Expiration**: Configurable token lifetime

### 2. Authorization

-   **RBAC**: Role-Based Access Control
-   **Roles**: `admin`, `user`
-   **Enforcement**: Middleware layer

### 3. Data Access Control

-   Admin users: Full access to all data
-   Regular users: Filtered access based on ownership

## Scalability Considerations

### 1. Horizontal Scaling

-   **Stateless Design**: No server-side session storage
-   **Connection Pooling**: Efficient database connections
-   **Load Balancing Ready**: Can run multiple instances

### 2. Vertical Scaling

-   **Async Operations**: Non-blocking I/O
-   **Resource Management**: Connection pool limits
-   **Memory Efficiency**: Stream large payloads

### 3. Database Scaling

-   **Connection Pool**: Configurable pool size
-   **Query Optimization**: Use database functions
-   **Caching Strategy**: Ready for Redis integration

## Maintainability Features

### 1. Code Organization

-   Clear folder structure
-   Single Responsibility Principle
-   Consistent naming conventions

### 2. Type Safety

-   TypeScript throughout
-   Strict type checking
-   Interface definitions

### 3. Error Handling

-   Consistent error format
-   Proper logging
-   Graceful degradation

### 4. Documentation

-   Inline code comments
-   Comprehensive guides
-   Architecture documentation

## Testing Strategy

### 1. Unit Tests

-   Test services in isolation
-   Mock external dependencies
-   Test business logic

### 2. Integration Tests

-   Test controllers with mocked services
-   Test route handlers
-   Test middleware chain

### 3. E2E Tests

-   Test complete request/response cycle
-   Test authentication flow
-   Test error scenarios

## Monitoring & Logging

### 1. Request Logging

```typescript
[2025-11-14T10:30:00.000Z] POST /api/lessons 201 - 45ms
```

### 2. Error Logging

```typescript
[AuthService] Login error: Invalid credentials
[LessonController] Get lesson error: Database connection failed
```

### 3. Health Checks

-   `/health`: Basic health status
-   `/api/status`: Detailed system status

## Future Enhancements

### Planned Features

1. **Caching Layer**: Redis for frequently accessed data
2. **Rate Limiting**: Prevent API abuse
3. **API Versioning**: Support multiple API versions
4. **WebSocket Support**: Real-time features
5. **GraphQL**: Alternative query interface
6. **Microservices**: Split into smaller services
7. **Message Queue**: Async job processing
8. **API Gateway**: Centralized routing

### Performance Optimizations

1. **Response Compression**: gzip/brotli
2. **Database Query Optimization**: Indexes, query planning
3. **CDN Integration**: Static asset delivery
4. **Edge Caching**: CloudFlare/Fastly
5. **Database Read Replicas**: Separate read/write operations

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Author**: Development Team
