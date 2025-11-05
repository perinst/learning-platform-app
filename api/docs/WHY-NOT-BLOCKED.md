# ✅ SOLUTION: PostgREST is NOT Blocked - Here's Why and How to Fix

## The Problem

You asked: **"why http://localhost:3001 not blocked?"**

### Answer: Because Express is running on your HOST machine, not in Docker!

When you run `npm run dev`:

- Express runs on your **host machine** (Windows)
- PostgREST runs in **Docker container**
- For Express to reach PostgREST, we must expose port 3001
- But this also allows **YOU** to access it directly! ❌

---

## The Real Solution: Run Everything in Docker

### Current Status:

```
┌─────────────────────────────────────────┐
│         Your Computer (Host)            │
│                                         │
│  Express (npm run dev)  ←─ PID 22276   │ ← You're here
│      ↓ needs access                     │
│  Port 3001 (exposed)                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         Docker Network                  │
│                                         │
│  PostgREST:3000 ← exposed as :3001     │ ← Accessible from host!
│  PostgreSQL:5432                        │
└─────────────────────────────────────────┘
```

**Problem:** Anyone can access `http://localhost:3001/lessons` ❌

---

### ✅ Fixed Architecture (Full Isolation):

```
┌─────────────────────────────────────────┐
│         Your Computer (Host)            │
│                                         │
│  Port 4000 (exposed) ← Only entry point │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         Docker Network (Internal)       │
│                                         │
│  Express:4000 ← Auth Middleware         │ ← Entry point
│      ↓                                  │
│  PostgREST:3000 ← NOT exposed to host  │ ← Blocked!
│      ↓                                  │
│  PostgreSQL:5432                        │
└─────────────────────────────────────────┘
```

**Solution:** PostgREST has NO port mapping, only Express is exposed ✅

---

## How to Fix (Step by Step)

### Step 1: Stop npm run dev

Find the process:

```bash
netstat -ano | findstr :4000
# Output: TCP 0.0.0.0:4000 ... LISTENING 22276
```

Kill it:

```bash
taskkill /PID 22276 /F
```

Or use **Ctrl+C** in the terminal where `npm run dev` is running.

### Step 2: Start Everything in Docker

```bash
docker-compose up -d
```

This will:

- ✅ Build Express container
- ✅ Start PostgreSQL
- ✅ Start PostgREST (internal only, NO port exposed)
- ✅ Start Express (port 4000 exposed)
- ✅ Start Adminer

### Step 3: Verify PostgREST is Blocked

**Try accessing PostgREST directly (should FAIL):**

```bash
curl http://localhost:3001/lessons
```

**Expected result:**

```
curl: (7) Failed to connect to localhost port 3001: Connection refused
```

✅ **Perfect! PostgREST is blocked!**

### Step 4: Verify Express Works

**Login:**

```bash
curl -X POST http://localhost:4000/rpc/verify_login ^
  -H "Content-Type: application/json" ^
  -d "{\"p_email\":\"admin@example.com\",\"p_password\":\"admin123\"}"
```

**Access with token:**

```bash
curl http://localhost:4000/lessons ^
  -H "Authorization: Bearer <token_from_login>"
```

✅ **Works through Express!**

---

## Development Workflow

### Option 1: Full Docker (Recommended for Security)

**Pros:**

- ✅ PostgREST fully blocked
- ✅ Production-like environment
- ✅ Complete isolation

**Cons:**

- ⚠️ Need to rebuild for code changes
- ⚠️ Slower development cycle

**Usage:**

```bash
# Make code changes
# Rebuild and restart
docker-compose up --build -d

# View logs
docker-compose logs -f express

# Stop
docker-compose down
```

---

### Option 2: Development with npm (Faster iteration)

**Pros:**

- ✅ Hot reload (tsx watch)
- ✅ Faster development
- ✅ Better debugging

**Cons:**

- ❌ PostgREST accessible at localhost:3001
- ⚠️ Security risk (development only!)

**Usage:**

1. **Update docker-compose.yml** (add port back):

```yaml
postgrest:
    ports:
        - '3001:3000' # Expose for development
```

2. **Update .env** (use localhost):

```env
DB_HOST=localhost
POSTGREST_URL=http://localhost:3001
```

3. **Start services:**

```bash
# Start only database services
docker-compose up -d postgres postgrest adminer

# Run Express locally
npm run dev
```

**⚠️ Warning:** PostgREST is accessible in this mode! Only use for development.

---

## Current Docker Setup (Already Done)

I've already created:

1. **Dockerfile** ✅
    - Builds TypeScript
    - Runs Node.js app
    - Health checks included

2. **docker-compose.yml** ✅
    - Express service added
    - PostgREST has NO port mapping
    - All on internal network

3. **.dockerignore** ✅
    - Excludes unnecessary files
    - Includes source code

4. **.env.docker** ✅
    - Docker service names
    - Internal URLs

---

## Quick Commands

### Full Docker (Secure):

```bash
# Stop any running npm dev
taskkill /PID 22276 /F  # Replace with your PID

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Test PostgREST (should fail)
curl http://localhost:3001/lessons

# Test Express (should work)
curl http://localhost:4000/health
```

### Development Mode (Less Secure):

```bash
# Start database services only
docker-compose up -d postgres postgrest adminer

# Run Express locally
npm run dev
```

---

## Summary

| Setup           | PostgREST  | Development Speed    | Security | Use Case            |
| --------------- | ---------- | -------------------- | -------- | ------------------- |
| **Full Docker** | ✅ Blocked | ⚠️ Slower (rebuild)  | ✅ High  | Production, Testing |
| **npm run dev** | ❌ Exposed | ✅ Fast (hot reload) | ⚠️ Low   | Development only    |

### Recommendation:

**For now (to answer your question):**

```bash
# Stop npm run dev
# Start full Docker
docker-compose up -d
```

**PostgREST will be FULLY BLOCKED!** ✅

Test it:

```bash
curl http://localhost:3001/lessons
# Connection refused ← Perfect!
```

---

## Why It Wasn't Blocked Before

The initial setup had:

```yaml
postgrest:
    ports:
        - '3001:3000' # ❌ This exposes PostgREST to host
```

This is **necessary** when Express runs on the host (npm run dev), but it also means anyone can access PostgREST directly.

**The fix:** Run Express in Docker too, remove the port mapping. ✅

Now done! Just run `docker-compose up -d` after stopping npm.
