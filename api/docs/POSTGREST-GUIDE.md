# PostgREST API Guide

Your API is now **auto-generated** from PostgreSQL! No code needed. 🎉

## 🚀 Quick Start

### 1. Start Everything

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL** on port 5432
- **PostgREST API** on port 4000 (auto-generated!)
- **Adminer UI** on port 8080

### 2. Check API is Running

```bash
curl http://localhost:4000
```

You should see the OpenAPI specification.

---

## 🔐 Authentication Endpoints

### Login (Verify Password)

```bash
curl -X POST http://localhost:4000/rpc/verify_login \
  -H "Content-Type: application/json" \
  -d "{\"p_email\":\"user@example.com\",\"p_password\":\"user123\"}"
```

**Response (success):**

```json
[
    {
        "user_id": "uuid-here",
        "user_email": "user@example.com",
        "user_name": "John Doe",
        "user_role": "user",
        "user_created_at": "2024-01-15T00:00:00Z"
    }
]
```

**Response (wrong password):**

```json
[]
```

### Register New User

```bash
curl -X POST http://localhost:4000/rpc/register_user \
  -H "Content-Type: application/json" \
  -d "{\"p_email\":\"newuser@example.com\",\"p_password\":\"pass123\",\"p_name\":\"New User\",\"p_role\":\"user\"}"
```

**Response:**

```json
[
    {
        "user_id": "new-uuid",
        "user_email": "newuser@example.com",
        "user_name": "New User",
        "user_role": "user",
        "user_created_at": "2025-10-20T..."
    }
]
```

### Change Password

```bash
curl -X POST http://localhost:4000/rpc/change_password \
  -H "Content-Type: application/json" \
  -d "{\"p_user_id\":\"uuid-here\",\"p_old_password\":\"user123\",\"p_new_password\":\"newpass456\"}"
```

**Response (success):**

```json
true
```

**Response (wrong old password):**

```json
false
```

---

## 📊 Data Endpoints (Auto-Generated)

PostgREST automatically creates REST endpoints for all your tables:

### Get All Users

```bash
curl http://localhost:4000/users
```

### Get User by ID

```bash
curl "http://localhost:4000/users?id=eq.00000000-0000-0000-0000-000000000002"
```

### Get All Published Lessons

```bash
curl "http://localhost:4000/lessons?status=eq.published"
```

### Get Lessons by Category

```bash
curl "http://localhost:4000/lessons?category=eq.Web%20Development&status=eq.published"
```

### Get User Progress

```bash
curl "http://localhost:4000/progress?user_id=eq.00000000-0000-0000-0000-000000000002"
```

### Get Lessons with Progress (Join)

```bash
curl "http://localhost:4000/progress?select=*,lessons(*)"
```

### Get Chat Messages for a Lesson

```bash
curl "http://localhost:4000/chat_messages?lesson_id=eq.00000000-0000-0000-0000-000000000011"
```

---

## 🧪 Test Accounts

| Email             | Password | Role  |
| ----------------- | -------- | ----- |
| admin@example.com | admin123 | admin |
| user@example.com  | user123  | user  |
| jane@example.com  | user123  | user  |

---

## 🔍 Query Operators

PostgREST supports powerful query operators:

| Operator | Example                 | Description              |
| -------- | ----------------------- | ------------------------ |
| `eq`     | `?name=eq.John`         | Equals                   |
| `neq`    | `?status=neq.draft`     | Not equals               |
| `gt`     | `?progress=gt.50`       | Greater than             |
| `gte`    | `?progress=gte.50`      | Greater than or equal    |
| `lt`     | `?progress=lt.100`      | Less than                |
| `lte`    | `?progress=lte.100`     | Less than or equal       |
| `like`   | `?title=like.*React*`   | Pattern matching         |
| `ilike`  | `?title=ilike.*react*`  | Case-insensitive pattern |
| `in`     | `?role=in.(user,admin)` | In list                  |
| `is`     | `?summary=is.null`      | Is null                  |

### Examples:

```bash
# Get lessons containing "React" (case-insensitive)
curl "http://localhost:4000/lessons?title=ilike.*React*"

# Get users created after 2024-01-01
curl "http://localhost:4000/users?created_at=gte.2024-01-01"

# Get incomplete progress (less than 100)
curl "http://localhost:4000/progress?progress=lt.100"
```

---

## 📝 Insert Data

### Create New Lesson (Admin)

```bash
curl -X POST http://localhost:4000/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Node.js Basics",
    "description": "Learn Node.js fundamentals",
    "content": "# Node.js\n\nNode.js is...",
    "category": "Backend Development",
    "status": "published",
    "created_by": "00000000-0000-0000-0000-000000000001"
  }'
```

### Update Progress

```bash
curl -X POST http://localhost:4000/progress \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000002",
    "lesson_id": "00000000-0000-0000-0000-000000000011",
    "completed": true,
    "progress": 100
  }'
```

### Add Chat Message

```bash
curl -X POST http://localhost:4000/chat_messages \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000002",
    "lesson_id": "00000000-0000-0000-0000-000000000011",
    "role": "user",
    "content": "What is JSX?"
  }'
```

---

## 🔧 Update Data

### Update User Name

```bash
curl -X PATCH "http://localhost:4000/users?id=eq.00000000-0000-0000-0000-000000000002" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated Doe"}'
```

### Mark Lesson as Completed

```bash
curl -X PATCH "http://localhost:4000/progress?user_id=eq.00000000-0000-0000-0000-000000000002&lesson_id=eq.00000000-0000-0000-0000-000000000011" \
  -H "Content-Type: application/json" \
  -d '{"completed": true, "progress": 100}'
```

---

## 🗑️ Delete Data

### Delete User (cascades to progress, chat)

```bash
curl -X DELETE "http://localhost:4000/users?id=eq.uuid-here"
```

### Delete Lesson

```bash
curl -X DELETE "http://localhost:4000/lessons?id=eq.uuid-here"
```

---

## 📖 API Documentation

PostgREST auto-generates OpenAPI docs:

**View in browser:**
http://localhost:4000

**Download OpenAPI spec:**

```bash
curl http://localhost:4000 > api-spec.json
```

---

## 🛠️ Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Reset database (delete all data)
docker-compose down -v && docker-compose up -d

# View API logs
docker-compose logs -f postgrest

# View database logs
docker-compose logs -f postgres

# Test if API is running
curl http://localhost:4000
```

---

## 🔗 Service URLs

| Service       | URL                   | Purpose                 |
| ------------- | --------------------- | ----------------------- |
| PostgREST API | http://localhost:4000 | Auto-generated REST API |
| Adminer       | http://localhost:8080 | Database UI             |
| PostgreSQL    | localhost:5432        | Direct database access  |

---

## 💡 Tips

1. **No Code Required**: PostgREST reads your database schema and creates endpoints automatically
2. **Add New Tables**: Just add a table in SQL, PostgREST creates endpoints instantly
3. **Functions = RPC**: PostgreSQL functions become `/rpc/function_name` endpoints
4. **Security**: In production, use proper authentication (JWT, roles, row-level security)
5. **Joins**: Use `select=*,related_table(*)` for relationships

---

## 🎯 Example: Complete Login Flow

```bash
# 1. Login
RESPONSE=$(curl -s -X POST http://localhost:4000/rpc/verify_login \
  -H "Content-Type: application/json" \
  -d '{"p_email":"user@example.com","p_password":"user123"}')

echo $RESPONSE
# [{"user_id":"...","user_email":"user@example.com",...}]

# 2. Extract user_id (in real app, parse JSON)
USER_ID="00000000-0000-0000-0000-000000000002"

# 3. Get user's progress
curl "http://localhost:4000/progress?user_id=eq.$USER_ID&select=*,lessons(title,category)"

# 4. Get user's chat history
curl "http://localhost:4000/chat_messages?user_id=eq.$USER_ID&order=timestamp.desc&limit=20"
```

---

## 🚀 You're Ready!

Your API is live and **zero code was needed**! Just PostgreSQL + PostgREST = instant REST API. 🎉

For more advanced features, check [PostgREST Documentation](https://postgrest.org/en/stable/).
