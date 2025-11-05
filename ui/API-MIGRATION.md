# API Integration Migration Summary

## Overview

Successfully migrated the learning platform UI from mock localStorage-based API to real PostgreSQL + PostgREST backend with Express authentication proxy.

## Changes Made

### 1. Configuration Files Created

#### `.env.example`

```env
VITE_API_URL=http://localhost:4000
```

#### `.env.local` (for development)

```env
VITE_API_URL=http://localhost:4000
```

#### `src/config/api.config.ts`

- Base URL configuration: `http://localhost:4000`
- Timeout: 10 seconds
- Storage keys for access token and user data

### 2. Type Definitions

#### `src/types/api.types.ts`

New types matching PostgreSQL schema:

- `User` - with `created_at` (snake_case from backend)
- `Lesson` - with `image_url`, `created_at`, `created_by`
- `Progress` - with `user_id`, `lesson_id`, `last_accessed`
- `AccessToken` - login response with JWT token
- Request types: `LoginRequest`, `RegisterRequest`, `CreateLessonRequest`, etc.

### 3. API Implementation (`src/api/index.ts`)

Complete rewrite to use real HTTP requests:

#### Authentication API

- ✅ `getCurrentUser()` - Validates token with backend, returns cached user
- ✅ `login()` - POST to `/rpc/verify_login`, stores JWT token
- ✅ `logout()` - Clears token and user data from localStorage
- ✅ `register()` - POST to `/rpc/register_user` (new function)
- ✅ `getUsers()` - GET `/users` with authentication

#### Lessons API

- ✅ `getLessons()` - GET `/lessons?order=created_at.desc`
- ✅ `getLesson(id)` - GET `/lessons?id=eq.{id}`
- ✅ `createLesson()` - POST `/rpc/create_lesson` (admin only, uses token from context)
- ✅ `updateLesson()` - POST `/rpc/update_lesson` (admin only)
- ✅ `deleteLesson()` - POST `/rpc/delete_lesson` (admin only)

#### Progress API

- ✅ `getProgress()` - GET `/progress`
- ✅ `getUserProgress(userId)` - GET `/progress?user_id=eq.{userId}`
- ✅ `getLessonProgress(userId, lessonId)` - GET with filters
- ✅ `updateProgress()` - POST with `Prefer: resolution=merge-duplicates` (upsert)
- ✅ `markLessonAccessed()` - POST to update last_accessed timestamp

### 4. Authentication Flow

**Before (Mock):**

```typescript
// Checked localStorage only
const user = localStorage.getItem('currentUser');
```

**After (Real Backend):**

```typescript
// 1. Login -> Get JWT token
POST /rpc/verify_login { p_email, p_password }
Response: { access_token, user_id, user_email, ... }

// 2. Store token in localStorage
localStorage.setItem('access_token', token);

// 3. All subsequent requests include:
Headers: { Authorization: "Bearer <token>" }

// 4. getCurrentUser validates token with backend
GET /users?id=eq.{user_id}
```

### 5. Security Features

- ✅ All requests (except login/register) require `Authorization: Bearer <token>` header
- ✅ Token validation on every getCurrentUser() call
- ✅ Admin-only operations enforced by backend RPC functions
- ✅ PostgREST protected behind Express proxy (port 3001 internal only)
- ✅ All external requests go through Express on port 4000

### 6. Data Model Changes

#### User

```typescript
// Frontend (camelCase)
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  password?: string; // Optional, not from API
}

// Backend returns (snake_case)
{
  id: "uuid",
  email: "user@example.com",
  name: "John Doe",
  role: "user",
  created_at: "2024-01-15T00:00:00Z"
}
```

#### Lesson

```typescript
// Frontend
(imageUrl, createdAt, createdBy);

// Backend
(image_url, created_at, created_by);
```

#### Progress

```typescript
// Frontend
(userId, lessonId, lastAccessed);

// Backend
(user_id, lesson_id, last_accessed);
```

### 7. Hook Updates

#### `useLessons.ts`

- Removed `userId` parameter from `useCreateLesson()` (backend gets user from token)

#### Components Updated

- `LessonEditor.tsx` - Removed `userId` from `createLessonMutation.mutateAsync()`

### 8. Storage Keys Changed

**Before:**

```typescript
CURRENT_USER: 'currentUser';
LESSONS: 'lessons';
PROGRESS: 'progress';
```

**After:**

```typescript
ACCESS_TOKEN: 'access_token';
USER_DATA: 'user_data';
// No more client-side data storage
```

## Backend Integration Points

### Public Endpoints (No Auth Required)

- `POST /rpc/register_user` - User registration
- `POST /rpc/verify_login` - User login

### Protected Endpoints (Require Bearer Token)

- `GET /users` - List all users
- `GET /lessons` - List lessons
- `GET /lessons?id=eq.{id}` - Get specific lesson
- `GET /progress` - Get all progress
- `GET /progress?user_id=eq.{id}` - Get user's progress
- `POST /progress` - Update progress (upsert)

### Admin-Only Endpoints

- `POST /rpc/create_lesson` - Create lesson
- `POST /rpc/update_lesson` - Update lesson
- `POST /rpc/delete_lesson` - Delete lesson

## Testing the Integration

### 1. Start Backend Services

```bash
cd ..\learning-platform-api
docker-compose up -d
npm run dev
```

### 2. Start Frontend

```bash
cd learning-platform-ui
npm run dev
```

### 3. Test Login

- Navigate to http://localhost:5173
- Login with: `admin@example.com` / `admin123`
- Check browser DevTools > Application > Local Storage
    - Should see `access_token` with JWT
    - Should see `user_data` with user object

### 4. Test Data Loading

- Dashboard should load real lessons from PostgreSQL
- Progress should be fetched from backend
- Changes persist in database

### 5. Test Admin Functions (as admin)

- Create new lesson → POST /rpc/create_lesson
- Edit lesson → POST /rpc/update_lesson
- Delete lesson → POST /rpc/delete_lesson

## Error Handling

The new API includes proper error handling:

```typescript
try {
    await authApi.login(email, password);
} catch (error) {
    // error.message contains backend error
    toast.error(error.message);
}
```

Common errors:

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Admin access required
- `404 Not Found` - Resource doesn't exist
- `500 Server Error` - Backend error

## Migration Benefits

✅ **Real Persistence** - Data saved in PostgreSQL, survives page refresh
✅ **Multi-User Support** - Multiple users can access same data
✅ **Secure Authentication** - JWT tokens, server-side validation
✅ **Role-Based Access** - Admin permissions enforced by backend
✅ **API Standards** - RESTful endpoints, proper HTTP methods
✅ **Type Safety** - TypeScript types match database schema
✅ **Scalability** - Ready for production deployment

## Next Steps (Optional)

1. **Token Refresh** - Implement automatic token refresh when expired
2. **Error Toast Improvements** - Better user-facing error messages
3. **Loading States** - Add skeleton loaders during API calls
4. **Offline Support** - Add service worker for offline functionality
5. **Rate Limiting** - Implement request throttling
6. **File Uploads** - Add image upload for lesson thumbnails

## Development vs Production

### Development

- Frontend: `http://localhost:5173` (Vite)
- Backend: `http://localhost:4000` (Express Auth Proxy)
- Database: `localhost:5432` (PostgreSQL)

### Production (Future)

- Frontend: Static hosting (Vercel, Netlify, etc.)
- Backend: Deployed Express + PostgREST + PostgreSQL
- HTTPS with proper SSL certificates
- Environment variables for API URLs

## Rollback Plan (If Needed)

The old mock implementation is commented out in git history. To rollback:

1. Restore `src/api/index.ts` from previous commit
2. Remove `.env.local` and `src/config/api.config.ts`
3. Revert `src/utils/mockData.ts` User interface change

## Documentation References

- API Documentation: `api-docs/POSTGREST-GUIDE.md`
- Authentication: `api-docs/AUTH-PROXY-GUIDE.md`
- Security: `api-docs/RBAC-GUIDE.md`
- Architecture: `api-docs/ARCHITECTURE-COMPARISON.md`
