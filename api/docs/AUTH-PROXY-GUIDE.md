# Authentication Proxy Guide

## Architecture Overview

```
Client (Port 4000)
    ↓
Express Auth Proxy (TypeScript)
    ↓ (Authentication & RBAC)
PostgREST (Port 3001 - Internal Only)
    ↓
PostgreSQL (Port 5432)
```

## How It Works

1. **All requests go through Express** on port 4000
2. **Public routes** (register, login) bypass authentication
3. **Protected routes** require `Authorization: Bearer <token>` header
4. **Express validates token** with PostgreSQL
5. **RBAC checks** admin permissions for protected operations
6. **Request is proxied** to PostgREST with user context headers
7. **PostgREST** cannot be accessed directly from outside

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Services

```bash
# Start PostgreSQL and PostgREST
docker-compose up -d

# Start Express Auth Proxy (development mode)
npm run dev

# Or build and run in production mode
npm run build
npm start
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Register User

```bash
POST http://localhost:4000/rpc/register_user
Content-Type: application/json

{
  "p_email": "newuser@example.com",
  "p_password": "password123",
  "p_name": "New User",
  "p_role": "user"
}
```

#### Login

```bash
POST http://localhost:4000/rpc/verify_login
Content-Type: application/json

{
  "p_email": "admin@example.com",
  "p_password": "admin123"
}

# Response includes token:
{
  "user_id": "...",
  "user_email": "admin@example.com",
  "access_token": "abc123...",
  "expires_at": "2025-10-28T..."
}
```

### Protected Endpoints (Require Authentication)

All other endpoints require the `Authorization` header:

```bash
Authorization: Bearer <your_token_here>
```

#### Get All Lessons (Any authenticated user)

```bash
GET http://localhost:4000/lessons
Authorization: Bearer abc123...
```

#### Get User Progress (Any authenticated user)

```bash
GET http://localhost:4000/progress?user_id=eq.<user_id>
Authorization: Bearer abc123...
```

#### Create Lesson (Admin only)

```bash
POST http://localhost:4000/rpc/create_lesson
Authorization: Bearer abc123...
Content-Type: application/json

{
  "p_token": "abc123...",
  "p_title": "New Lesson",
  "p_description": "Description",
  "p_content": "Content",
  "p_category": "Programming",
  "p_status": "published"
}
```

#### Update Lesson (Admin only)

```bash
POST http://localhost:4000/rpc/update_lesson
Authorization: Bearer abc123...
Content-Type: application/json

{
  "p_token": "abc123...",
  "p_lesson_id": "<lesson_id>",
  "p_title": "Updated Title"
}
```

#### Delete Lesson (Admin only)

```bash
POST http://localhost:4000/rpc/delete_lesson
Authorization: Bearer abc123...
Content-Type: application/json

{
  "p_token": "abc123...",
  "p_lesson_id": "<lesson_id>"
}
```

## Security Features

### 🔒 Authentication

- All requests (except public routes) require valid Bearer token
- Tokens are verified against PostgreSQL database
- Expired tokens are automatically rejected

### 🛡️ RBAC (Role-Based Access Control)

- **User role**: Can read lessons, manage their own progress
- **Admin role**: Can create, update, delete lessons

Admin-only operations:

- Creating lessons
- Updating lessons
- Deleting lessons
- User management

### 🚫 PostgREST Protection

- PostgREST runs on port **3001** (internal network only)
- Cannot be accessed directly from outside Docker network
- All external requests must go through Express proxy on port **4000**
- Express validates authentication before forwarding to PostgREST

### 📋 Request Context

Express adds user context headers when proxying:

- `X-User-Id`: User's UUID
- `X-User-Email`: User's email
- `X-User-Role`: User's role (admin/user)

These can be used by PostgREST or PostgreSQL for additional validation.

## Error Responses

### 401 Unauthorized

```json
{
    "error": "Unauthorized",
    "message": "Missing or invalid Authorization header"
}
```

### 403 Forbidden

```json
{
    "error": "Forbidden",
    "message": "Admin access required for this operation"
}
```

### 500 Server Error

```json
{
    "error": "Proxy error occurred"
}
```

## Development

### Run in Watch Mode

```bash
npm run dev
```

### Build TypeScript

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learning_platform
DB_USER=postgres
DB_PASSWORD=postgres

# PostgREST (internal)
POSTGREST_URL=http://localhost:3001

# Express Server
PORT=4000
NODE_ENV=development
```

## Testing Scenarios

### 1. Test Public Access (Should Work)

```bash
curl -X POST http://localhost:4000/rpc/verify_login \
  -H "Content-Type: application/json" \
  -d '{"p_email": "admin@example.com", "p_password": "admin123"}'
```

### 2. Test Protected Route Without Token (Should Fail)

```bash
curl http://localhost:4000/lessons
# Response: 401 Unauthorized
```

### 3. Test Protected Route With Token (Should Work)

```bash
curl http://localhost:4000/lessons \
  -H "Authorization: Bearer <your_token>"
```

### 4. Test Admin Operation as User (Should Fail)

```bash
# Login as regular user first
curl -X POST http://localhost:4000/rpc/create_lesson \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"p_token": "<user_token>", "p_title": "Test"}'
# Response: 403 Forbidden
```

### 5. Test Direct PostgREST Access (Should Fail if properly networked)

```bash
curl http://localhost:3001/lessons
# Should not be accessible from outside Docker network
```

## Logging

The proxy logs all requests:

- `[PUBLIC]` - Public route access
- `[PROTECTED]` - Authenticated route access with user info
- `✓ Authenticated` - Successful authentication
- `Auth Error` - Authentication failures

Example:

```
✓ Authenticated: admin@example.com (admin)
[PROTECTED] GET /lessons - User: admin@example.com (admin)
```

## Benefits

✅ **Centralized Authentication**: Single point of auth validation
✅ **RBAC Enforcement**: Role-based permissions before reaching data
✅ **PostgREST Protection**: Cannot bypass auth by accessing PostgREST directly
✅ **Request Context**: User info available in headers
✅ **Flexible**: Easy to add custom middleware (rate limiting, logging, etc.)
✅ **Type Safety**: TypeScript for better development experience

## Customization

### Add New Public Routes

Edit `src/config/routes.config.ts`:

```typescript
export const publicRoutes = [
    '/rpc/register_user',
    '/rpc/verify_login',
    '/your_new_public_route', // Add here
];
```

### Add New Admin Routes

Edit `src/middleware/auth.middleware.ts` in the `isAdminRoute()` function:

```typescript
const adminRoutes = [{ method: 'POST', pattern: /^\/your_admin_route/ }];
```

### Add Custom Middleware

Edit `src/index.ts`:

```typescript
// Add before auth middleware
app.use(yourCustomMiddleware);
```
