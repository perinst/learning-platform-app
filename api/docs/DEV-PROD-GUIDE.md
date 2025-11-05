# 🚀 Development & Production Setup Guide

## Two Modes: Development vs Production

### 📦 Development Mode (PostgREST Exposed)

- Express runs on **host** with `npm run dev` (hot reload)
- PostgREST **exposed** on port 3001 (for Express to access)
- ⚠️ PostgREST accessible from localhost (security trade-off)
- **Use for:** Fast development with hot reload

### 🔒 Production Mode (PostgREST Blocked)

- Express runs in **Docker** container
- PostgREST **NOT exposed** (internal network only)
- ✅ PostgREST fully isolated and secure
- **Use for:** Production deployment, testing security

---

## Quick Start

### Development Mode (Fast iteration)

```bash
# Option 1: Automated
npm run dev:setup

# Option 2: Manual
docker-compose -f docker-compose.dev.yml up -d
npm run dev

# Option 3: Batch script (Windows)
.\\resources\\dev-start.bat
```

**What happens:**

- ✅ PostgreSQL starts (port 5432)
- ✅ PostgREST starts (port 3001) ⚠️ **EXPOSED**
- ✅ Adminer starts (port 8080)
- ✅ Express runs on host (port 4000) with hot reload

**Environment:**

- Uses `.env.development` or `.env`
- `POSTGREST_URL=http://localhost:3001`
- `DB_HOST=localhost`

---

### Production Mode (Secure & Isolated)

```bash
# Option 1: npm script
npm run docker:prod

# Option 2: Docker Compose
docker-compose up --build -d

# Option 3: Batch script (Windows)
.\\resources\\prod-start.bat
```

**What happens:**

- ✅ PostgreSQL starts (port 5432)
- ✅ PostgREST starts (internal only) ✅ **BLOCKED**
- ✅ Express starts in Docker (port 4000)
- ✅ Adminer starts (port 8080)

**Environment:**

- Uses `.env.production` or `.env.docker`
- `POSTGREST_URL=http://learning-platform-postgrest:3000`
- `DB_HOST=postgres`

---

## File Structure

```
learning-platform-api/
├── docker-compose.yml           # Production (PostgREST blocked)
├── docker-compose.dev.yml       # Development (PostgREST exposed)
├── Dockerfile                   # Express container
├── .env                         # Default (copy .env.development)
├── .env.development             # Dev config (localhost)
├── .env.production              # Prod config (Docker services)
├── .\\resources\\dev-start.bat                # Quick dev setup
├── .\\resources\\prod-start.bat               # Quick prod setup
└── package.json                 # npm scripts
```

---

## npm Scripts

```json
{
    "dev": "tsx watch src/index.ts", // Run Express on host
    "dev:setup": "...", // Start dev stack + Express
    "docker:dev": "...", // Start dev services only
    "docker:prod": "...", // Start prod stack
    "docker:down": "docker-compose down", // Stop all services
    "docker:logs": "docker-compose logs -f" // View logs
}
```

---

## Configuration Files

### `.env.development` (for npm run dev)

```env
DB_HOST=localhost
POSTGREST_URL=http://localhost:3001  # ⚠️ Exposed
PORT=4000
NODE_ENV=development
```

### `.env.production` (for Docker)

```env
DB_HOST=postgres                              # Docker service name
POSTGREST_URL=http://learning-platform-postgrest:3000  # Internal
PORT=4000
NODE_ENV=production
```

---

## Docker Compose Files

### `docker-compose.dev.yml` (Development)

```yaml
postgrest:
    ports:
        - '3001:3000' # ⚠️ EXPOSED for npm run dev
```

### `docker-compose.yml` (Production)

```yaml
postgrest:
    expose:
        - '3000' # ✅ Internal only
    # No ports mapping!

express:
    build: .
    ports:
        - '4000:4000' # Only Express exposed
```

---

## Workflows

### 🔧 Development Workflow

```bash
# 1. Start database services
npm run docker:dev
# or
.\\resources\\dev-start.bat

# 2. In another terminal, run Express
npm run dev

# 3. Code with hot reload! 🔥
# Edit files in src/, changes auto-reload

# 4. Stop when done
docker-compose -f docker-compose.dev.yml down
# (Ctrl+C to stop npm run dev)
```

**Endpoints:**

- Express: http://localhost:4000 ✅
- PostgREST: http://localhost:3001 ⚠️ (accessible)
- PostgreSQL: localhost:5432
- Adminer: http://localhost:8080

---

### 🚀 Production Workflow

```bash
# 1. Build and start everything
npm run docker:prod
# or
.\\resources\\prod-start.bat

# 2. Everything runs in Docker
# No need for npm run dev

# 3. View logs
npm run docker:logs

# 4. Stop when done
npm run docker:down
```

**Endpoints:**

- Express: http://localhost:4000 ✅ (only entry point)
- PostgREST: ❌ BLOCKED (internal only)
- PostgreSQL: localhost:5432
- Adminer: http://localhost:8080

---

## Testing Security

### Development Mode (PostgREST Exposed)

```bash
# PostgREST should be accessible
curl http://localhost:3001/lessons
# ⚠️ Returns data (this is expected in dev mode)
```

### Production Mode (PostgREST Blocked)

```bash
# PostgREST should be blocked
curl http://localhost:3001/lessons
# ✅ Connection refused (this is correct!)

# Express should work
curl http://localhost:4000/health
# ✅ {"status":"ok"}
```

---

## Comparison

| Feature              | Development Mode                                    | Production Mode                                        |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| **PostgREST Access** | ⚠️ Exposed (localhost:3001)                         | ✅ Blocked (internal only)                             |
| **Express Location** | Host (`npm run dev`)                                | Docker container                                       |
| **Hot Reload**       | ✅ Yes (tsx watch)                                  | ❌ No (rebuild needed)                                 |
| **Startup Time**     | ⚠️ Fast                                             | ⚠️ Slower (build)                                      |
| **Security**         | ⚠️ Lower (dev only)                                 | ✅ High (production-ready)                             |
| **Use Case**         | Development                                         | Production, Testing                                    |
| **Docker File**      | `docker-compose.dev.yml`                            | `docker-compose.yml`                                   |
| **Env File**         | `.env.development`                                  | `.env.production`                                      |
| **Start Command**    | `.\\resources\\dev-start.bat` / `npm run dev:setup` | `.\\resources\\prod-start.bat` / `npm run docker:prod` |

---

## Best Practices

### During Development:

1. ✅ Use `.\\resources\\dev-start.bat` or `npm run docker:dev`
2. ✅ Run `npm run dev` for hot reload
3. ⚠️ Accept that PostgREST is exposed (dev only!)
4. ✅ Test auth through Express (port 4000)

### Before Deployment:

1. ✅ Test with `.\\resources\\prod-start.bat` or `npm run docker:prod`
2. ✅ Verify PostgREST is blocked: `curl http://localhost:3001`
3. ✅ Verify Express works: `curl http://localhost:4000/health`
4. ✅ Run login/auth tests
5. ✅ Check logs: `npm run docker:logs`

### In Production:

1. ✅ Always use `docker-compose.yml` (not dev.yml)
2. ✅ Use `.env.production` with strong passwords
3. ✅ Never expose PostgREST port
4. ✅ Use HTTPS reverse proxy (nginx, Caddy, etc.)
5. ✅ Set proper CORS origins
6. ✅ Enable rate limiting

---

## Troubleshooting

### Port 4000 already in use

```bash
# Find and kill the process
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Can't connect to PostgreSQL

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs postgres
```

### PostgREST accessible in production mode

```bash
# Verify you're using the right compose file
docker-compose ps
# Should show "learning-platform-express" container

# Check compose file
cat docker-compose.yml | findstr "ports" -A 2
# PostgREST should have NO ports section
```

### Code changes not reflecting (dev mode)

```bash
# Ensure tsx watch is running
npm run dev
# Look for "Watching for file changes..."
```

### Build fails in Docker

```bash
# Check node_modules exist
npm install

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Summary

✅ **Development:** Fast iteration, PostgREST exposed (acceptable trade-off)  
✅ **Production:** Full security, PostgREST blocked, everything in Docker  
✅ **Easy switching:** Use `.\\resources\\dev-start.bat` or `.\\resources\\prod-start.bat`  
✅ **Best of both worlds:** Speed when developing, security when deploying

**Quick Commands:**

```bash
# Development (fast, less secure)
.\\resources\\dev-start.bat
npm run dev

# Production (secure, Docker)
.\\resources\\prod-start.bat
```

🎉 **You can now keep both workflows!**
