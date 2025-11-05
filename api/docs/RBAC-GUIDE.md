# JWT-Based Role-Based Access Control (RBAC) Guide

## 🔐 Overview

This API uses **PostgreSQL-based token authentication** with role-based access control. All authentication logic is handled by PostgreSQL functions - no Node.js/Express code needed!

## 🔑 Authentication Flow

### 1. Login & Get Token

**Request:**

```bash
curl -X POST http://localhost:4000/rpc/verify_login \
  -H "Content-Type: application/json" \
  -d '{
    "p_email": "admin@example.com",
    "p_password": "admin123"
  }'
```

**Response:**

```json
[
    {
        "user_id": "uuid-here",
        "user_email": "admin@example.com",
        "user_name": "Admin User",
        "user_role": "admin",
        "user_created_at": "2024-01-01T00:00:00Z",
        "access_token": "dGVzdC50b2tlbi5oZXJl...base64-encoded-token",
        "expires_at": "2024-10-27T00:00:00Z"
    }
]
```

**Save the `access_token` - you'll need it for authenticated requests!**

---

### 2. Verify Token

```bash
curl -X POST http://localhost:4000/rpc/verify_token \
  -H "Content-Type: application/json" \
  -d '{
    "p_token": "YOUR_TOKEN_HERE"
  }'
```

**Response:**

```json
[
    {
        "user_id": "uuid",
        "user_email": "admin@example.com",
        "user_name": "Admin User",
        "user_role": "admin",
        "token_expires_at": "2024-10-27T00:00:00Z"
    }
]
```

---

### 3. Logout (Invalidate Token)

```bash
curl -X POST http://localhost:4000/rpc/logout \
  -H "Content-Type: application/json" \
  -d '{
    "p_token": "YOUR_TOKEN_HERE"
  }'
```

**Response:**

```json
true // Token invalidated
```

---

## 👥 Role-Based Access

### User Roles

| Role    | Access Level                                                   |
| ------- | -------------------------------------------------------------- |
| `user`  | Read lessons, manage own progress & chat                       |
| `admin` | Full access: Create/Edit/Delete lessons + all user permissions |

---

## 🔒 Protected Endpoints (Admin Only)

### Create Lesson (Admin Only)

```bash
curl -X POST http://localhost:4000/rpc/create_lesson \
  -H "Content-Type: application/json" \
  -d '{
    "p_token": "YOUR_ADMIN_TOKEN",
    "p_title": "Advanced React Patterns",
    "p_description": "Learn advanced React patterns",
    "p_content": "# Advanced React\n\nContent here...",
    "p_category": "Web Development",
    "p_status": "published",
    "p_summary": "Master advanced React techniques",
    "p_image_url": "https://example.com/image.jpg"
  }'
```

**Response (Success):**

```json
[
    {
        "lesson_id": "new-uuid",
        "lesson_title": "Advanced React Patterns",
        "lesson_description": "Learn advanced React patterns",
        "lesson_category": "Web Development",
        "lesson_status": "published",
        "lesson_created_at": "2024-10-20T..."
    }
]
```

**Response (Unauthorized):**

```json
{
    "code": "P0001",
    "message": "Unauthorized: Admin access required"
}
```

---

### Update Lesson (Admin Only)

```bash
curl -X POST http://localhost:4000/rpc/update_lesson \
  -H "Content-Type: application/json" \
  -d '{
    "p_token": "YOUR_ADMIN_TOKEN",
    "p_lesson_id": "lesson-uuid-here",
    "p_title": "Updated Title",
    "p_status": "published"
  }'
```

**Response:**

```json
true // Success
```

---

### Delete Lesson (Admin Only)

```bash
curl -X POST http://localhost:4000/rpc/delete_lesson \
  -H "Content-Type: application/json" \
  -d '{
    "p_token": "YOUR_ADMIN_TOKEN",
    "p_lesson_id": "lesson-uuid-to-delete"
  }'
```

**Response:**

```json
true // Deleted successfully
```

---

## 🧪 Testing with Postman

### 1. Login and Save Token

**Request:**

- **Method**: `POST`
- **URL**: `http://localhost:4000/rpc/verify_login`
- **Body**:
    ```json
    {
        "p_email": "admin@example.com",
        "p_password": "admin123"
    }
    ```

**Tests** (Auto-extract token):

```javascript
// Save token to environment variable
const response = pm.response.json();
if (response.length > 0) {
    pm.environment.set('access_token', response[0].access_token);
    pm.environment.set('user_role', response[0].user_role);
}
```

---

### 2. Use Token in Requests

**Create Environment Variables in Postman:**

- `base_url`: `http://localhost:4000`
- `access_token`: (will be set automatically after login)

**Example - Create Lesson:**

- **URL**: `{{base_url}}/rpc/create_lesson`
- **Body**:
    ```json
    {
        "p_token": "{{access_token}}",
        "p_title": "New Lesson",
        "p_description": "Test",
        "p_content": "# Content",
        "p_category": "Programming",
        "p_status": "draft"
    }
    ```

---

## 📊 Database Schema

### user_sessions Table

| Column       | Type         | Description               |
| ------------ | ------------ | ------------------------- |
| id           | UUID         | Session ID                |
| user_id      | UUID         | Foreign key to users      |
| token        | VARCHAR(500) | Secure token (base64)     |
| expires_at   | TIMESTAMP    | Token expiration (7 days) |
| created_at   | TIMESTAMP    | Session creation time     |
| last_used_at | TIMESTAMP    | Last token usage          |

---

## 🔧 Available Functions

| Function                   | Parameters                | Returns      | Access        |
| -------------------------- | ------------------------- | ------------ | ------------- |
| `verify_login()`           | email, password           | User + token | Public        |
| `verify_token()`           | token                     | User info    | Public        |
| `logout()`                 | token                     | boolean      | Authenticated |
| `is_admin()`               | token                     | boolean      | Internal      |
| `get_user_id_from_token()` | token                     | UUID         | Internal      |
| `create_lesson()`          | token, lesson_data        | Lesson       | Admin only    |
| `update_lesson()`          | token, lesson_id, updates | boolean      | Admin only    |
| `delete_lesson()`          | token, lesson_id          | boolean      | Admin only    |

---

## 🛡️ Security Features

✅ **Token-based authentication** - No passwords sent after login
✅ **7-day token expiration** - Auto-expire for security
✅ **Role-based access control** - Admin vs User permissions
✅ **Session management** - Track active sessions
✅ **Auto-cleanup** - Old sessions removed on new login
✅ **Password change security** - Invalidates all sessions
✅ **Last used tracking** - Monitor token activity

---

## 💡 Best Practices

1. **Store tokens securely** in frontend (localStorage or sessionStorage)
2. **Include token in all protected requests**
3. **Handle 401 Unauthorized** - redirect to login
4. **Logout on exit** - invalidate tokens properly
5. **Token refresh** - login again before expiration
6. **HTTPS in production** - never send tokens over HTTP

---

## 🔄 Complete Authentication Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:4000/rpc/verify_login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        p_email: 'admin@example.com',
        p_password: 'admin123',
    }),
});

const [user] = await loginResponse.json();
const token = user.access_token;

// 2. Create lesson (admin only)
const createResponse = await fetch('http://localhost:4000/rpc/create_lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        p_token: token,
        p_title: 'New Lesson',
        p_description: 'Description',
        p_content: '# Content',
        p_category: 'Programming',
        p_status: 'draft',
    }),
});

// 3. Logout
await fetch('http://localhost:4000/rpc/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token }),
});
```

---

## 🎯 Test Accounts

| Email             | Password | Role  | Can Create Lessons? |
| ----------------- | -------- | ----- | ------------------- |
| admin@example.com | admin123 | admin | ✅ Yes              |
| user@example.com  | user123  | user  | ❌ No               |
| jane@example.com  | user123  | user  | ❌ No               |

---

Your JWT-based RBAC system is ready! 🚀
