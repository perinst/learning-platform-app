# 📊 Architecture Comparison: Dev vs Prod

## 🔧 Development Mode (PostgREST Exposed)

```
┌─────────────────────────────────────────────────────────┐
│              Your Computer (Host Machine)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Express (npm run dev)                          │   │
│  │  - Hot reload ✅                                │   │
│  │  - Port 4000                                    │   │
│  │  - tsx watch                                    │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                    │
│                    ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Port 3001 (EXPOSED) ⚠️                        │   │
│  └─────────────────┬───────────────────────────────┘   │
└────────────────────┼─────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌───────────────┐         ┌───────────────┐
│   Browser     │         │  curl/Postman │
│   Developer   │         │   Direct      │
└───────────────┘         │   Access      │
                          └───────────────┘
                                 ⚠️

┌─────────────────────────────────────────────────────────┐
│              Docker Network (internal)                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgREST                                      │   │
│  │  - Port 3000 → 3001 (mapped to host)           │   │
│  │  - Accessible from host ⚠️                     │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                    │
│                    ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                     │   │
│  │  - Port 5432                                    │   │
│  │  - Database storage                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Pros:**

- ✅ Fast development (hot reload)
- ✅ Quick iteration
- ✅ Easy debugging

**Cons:**

- ⚠️ PostgREST exposed to localhost
- ⚠️ Can bypass Express authentication
- ❌ Not production-ready

**Use for:** Development, coding, testing features

---

## 🚀 Production Mode (PostgREST Blocked)

```
┌─────────────────────────────────────────────────────────┐
│              Your Computer (Host Machine)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Port 4000 (ONLY PUBLIC ENDPOINT) ✅            │   │
│  └─────────────────┬───────────────────────────────┘   │
└────────────────────┼─────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌───────────────┐         ┌───────────────┐
│   Browser     │         │  curl/Postman │
│   User        │         │   API Client  │
└───────────────┘         └───────────────┘
                                 ✅

┌─────────────────────────────────────────────────────────┐
│         Docker Network (internal) 🔒                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Express Container                              │   │
│  │  - Port 4000 (exposed to host)                  │   │
│  │  - Authentication middleware ✅                 │   │
│  │  - RBAC enforcement ✅                          │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                    │
│                    ↓ (internal network only)           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgREST                                      │   │
│  │  - Port 3000 (NO HOST MAPPING) ✅               │   │
│  │  - Only accessible via Docker network 🔒        │   │
│  │  - CANNOT be accessed from host ✅              │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                    │
│                    ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                     │   │
│  │  - Port 5432                                    │   │
│  │  - Database storage                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

❌ Direct PostgREST access: BLOCKED
✅ Must go through Express authentication
```

**Pros:**

- ✅ PostgREST fully isolated
- ✅ Cannot bypass authentication
- ✅ Production-ready security
- ✅ Complete RBAC enforcement

**Cons:**

- ⚠️ No hot reload (must rebuild)
- ⚠️ Slower development iteration

**Use for:** Production deployment, security testing

---

## 🔄 Request Flow Comparison

### Development Mode (npm run dev)

```
User Request
    ↓
http://localhost:4000/lessons
    ↓
Express (Host Machine)
    ├─→ Auth Middleware ✅
    ├─→ RBAC Check ✅
    └─→ Proxy to PostgREST
             ↓
    http://localhost:3001 ⚠️ (can also be accessed directly!)
             ↓
    PostgREST (Docker)
             ↓
    PostgreSQL


⚠️ BYPASS POSSIBLE:
User → http://localhost:3001/lessons → PostgREST (NO AUTH!)
```

### Production Mode (Docker)

```
User Request
    ↓
http://localhost:4000/lessons
    ↓
Express (Docker Container)
    ├─→ Auth Middleware ✅
    ├─→ RBAC Check ✅
    └─→ Proxy to PostgREST
             ↓
    http://learning-platform-postgrest:3000 (internal)
             ↓
    PostgREST (Docker - internal network only)
             ↓
    PostgreSQL


✅ BYPASS IMPOSSIBLE:
User → http://localhost:3001/lessons → ❌ Connection refused
```

---

## 📝 Configuration Differences

### Development Mode

**docker-compose.dev.yml:**

```yaml
postgrest:
    ports:
        - '3001:3000' # ⚠️ EXPOSED to host
```

**.env.development:**

```env
DB_HOST=localhost           # Host machine
POSTGREST_URL=http://localhost:3001  # Exposed port
```

**Run Command:**

```bash
.\\resources\\dev-start.bat
npm run dev  # Express on host
```

---

### Production Mode

**docker-compose.yml:**

```yaml
postgrest:
    expose:
        - '3000' # ✅ Internal only, NO port mapping

express:
    build: .
    ports:
        - '4000:4000' # Only Express exposed
```

**.env.production:**

```env
DB_HOST=postgres  # Docker service name
POSTGREST_URL=http://learning-platform-postgrest:3000  # Internal
```

**Run Command:**

```bash
.\\resources\\prod-start.bat  # Everything in Docker
```

---

## 🎯 When to Use Each Mode

### Use Development Mode When:

- 🔧 Writing new features
- 🐛 Debugging code
- 🧪 Testing API endpoints
- ⚡ Need fast iteration
- 🔄 Want hot reload

### Use Production Mode When:

- 🚀 Deploying to server
- 🔒 Testing security
- 🧪 Integration testing
- 📦 Building for release
- ✅ Final validation

---

## 🔐 Security Comparison

| Aspect                | Development               | Production                |
| --------------------- | ------------------------- | ------------------------- |
| **PostgREST Access**  | ⚠️ localhost:3001 exposed | ✅ Blocked, internal only |
| **Bypass Possible**   | ❌ Yes (direct access)    | ✅ No (blocked)           |
| **Authentication**    | ⚠️ Can skip via PostgREST | ✅ Always enforced        |
| **RBAC**              | ⚠️ Can skip via PostgREST | ✅ Always enforced        |
| **Network Isolation** | ❌ No                     | ✅ Yes                    |
| **Production Ready**  | ❌ No                     | ✅ Yes                    |

---

## 📊 Performance Comparison

| Metric           | Development        | Production               |
| ---------------- | ------------------ | ------------------------ |
| **Startup Time** | ⚡ Fast (~5s)      | ⚠️ Slower (~15s + build) |
| **Hot Reload**   | ✅ Yes (tsx watch) | ❌ No (rebuild needed)   |
| **Code Changes** | ⚡ Instant         | ⚠️ Rebuild required      |
| **Memory Usage** | 🟢 Lower (host)    | 🟡 Higher (Docker)       |
| **CPU Usage**    | 🟢 Lower           | 🟡 Higher (containers)   |

---

## 🎉 Summary

You now have **TWO configurations**:

### 🔧 Development Mode (`.\\resources\\dev-start.bat`)

- ✅ Fast iteration with hot reload
- ⚠️ PostgREST exposed (acceptable for dev)
- ✅ Easy debugging
- ⚠️ Less secure (dev only!)

### 🚀 Production Mode (`.\\resources\\prod-start.bat`)

- ✅ PostgREST fully blocked
- ✅ Production-ready security
- ✅ Complete isolation
- ⚠️ Slower iteration (rebuild needed)

**Best practice:** Develop in dev mode, test in prod mode before deployment! 🎯
