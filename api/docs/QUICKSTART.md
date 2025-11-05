# Quick Start Guide

## Windows Setup (If npm doesn't work in PowerShell)

### Option 1: Fix PowerShell (Recommended)

Run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then:

```bash
npm install
npm run dev
```

### Option 2: Use CMD

Open Command Prompt (cmd.exe):

```cmd
cd c:\CODE\CT-TP\learning-platform-api
npm install
npm run dev
```

### Option 3: Use Git Bash

```bash
npm install
npm run dev
```

## Verification

After running `npm run dev`, you should see:

```
🚀 Auth Proxy Server running on port 4000
📡 Proxying to PostgREST at http://localhost:3001
🔒 All requests require authentication except public routes
```

## Test It

### 1. Login (Public Route)

```bash
curl -X POST http://localhost:4000/rpc/verify_login ^
  -H "Content-Type: application/json" ^
  -d "{\"p_email\": \"admin@example.com\", \"p_password\": \"admin123\"}"
```

Copy the `access_token` from the response.

### 2. Access Protected Route

```bash
curl http://localhost:4000/lessons ^
  -H "Authorization: Bearer <paste_token_here>"
```

### 3. Try Without Token (Should Fail)

```bash
curl http://localhost:4000/lessons
```

Should return:

```json
{
    "error": "Unauthorized",
    "message": "Missing or invalid Authorization header. Use: Bearer <token>"
}
```

## Architecture Confirmed ✅

✅ Express running on port 4000 (public-facing)
✅ PostgREST on port 3001 (internal only)
✅ PostgreSQL on port 5432 (internal)
✅ Authentication middleware active
✅ RBAC checking admin permissions
✅ Direct PostgREST access blocked from outside

## Services

| Service       | Port | Access                       |
| ------------- | ---- | ---------------------------- |
| Express Proxy | 4000 | Public (with auth)           |
| PostgREST     | 3001 | Internal Docker network only |
| PostgreSQL    | 5432 | Docker network + localhost   |
| Adminer       | 8080 | Public (database UI)         |

## Next Steps

Read `README.md` for full documentation!
