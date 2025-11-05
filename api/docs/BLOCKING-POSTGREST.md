# Blocking PostgREST - Complete Solution

## The Problem

Currently, PostgREST is accessible at `http://localhost:3001` because of this in `docker-compose.yml`:

```yaml
postgrest:
    ports:
        - '3001:3000' # ❌ This exposes PostgREST to localhost!
```

Anyone can bypass Express and access PostgREST directly!

## The Solution

We have **2 options** depending on where Express runs:

---

## ✅ Option 1: Express OUTSIDE Docker (Recommended for Development)

**Use Case:** Running Express with `npm run dev` on your host machine.

### Changes Required:

#### 1. Keep PostgREST port exposed (current setup)

```yaml
# docker-compose.yml
postgrest:
    ports:
        - '127.0.0.1:3001:3000' # Bind to 127.0.0.1 only
```

#### 2. Use firewall rules (Windows)

**Block external access to port 3001:**

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Block PostgREST External" dir=in action=block protocol=TCP localport=3001 remoteip=any

# Only allow localhost
netsh advfirewall firewall add rule name="Allow PostgREST Localhost" dir=in action=allow protocol=TCP localport=3001 remoteip=127.0.0.1
```

**Note:** This only blocks external network access, not localhost applications.

---

## ✅ Option 2: Express INSIDE Docker (Fully Isolated - Production Ready)

**Use Case:** Production deployment where everything runs in Docker.

### Changes Required:

#### 1. Remove PostgREST port mapping

```yaml
# docker-compose.yml
postgrest:
    # Remove this:
    # ports:
    #   - "3001:3000"

    # Replace with:
    expose:
        - '3000' # Only accessible within Docker network
```

#### 2. Add Express to docker-compose.yml

```yaml
services:
    # ... postgres and postgrest ...

    express-proxy:
        build: .
        container_name: learning-platform-express
        restart: unless-stopped
        ports:
            - '4000:4000' # Only Express exposed to host
        environment:
            DB_HOST: postgres
            DB_PORT: 5432
            DB_NAME: learning_platform
            DB_USER: postgres
            DB_PASSWORD: postgres
            POSTGREST_URL: http://learning-platform-postgrest:3000 # Use Docker service name
            PORT: 4000
            NODE_ENV: production
        depends_on:
            - postgres
            - postgrest
        networks:
            - internal # Same network as PostgREST
```

#### 3. Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

#### 4. Update .env

```env
POSTGREST_URL=http://learning-platform-postgrest:3000
```

---

## 🎯 Quick Fix (Right Now)

**Immediate solution while keeping Express on host:**

### Update docker-compose.yml:

```yaml
postgrest:
    ports:
        - '127.0.0.1:3001:3000' # Bind to localhost only, not 0.0.0.0
```

This prevents external network access but **still allows localhost access** (which includes your Express app AND direct browser/curl access).

### Full Isolation (Recommended):

Implement **Option 2** above to run Express in Docker. Then:

1. PostgREST has NO port mapping to host
2. Express communicates via Docker network: `http://learning-platform-postgrest:3000`
3. Only Express port 4000 is exposed to host
4. **Impossible** to access PostgREST directly from host

---

## Testing

### Test Current Setup (PostgREST accessible):

```bash
curl http://localhost:3001/lessons
# ❌ Works - PostgREST is exposed!
```

### Test After Option 2 (PostgREST blocked):

```bash
curl http://localhost:3001/lessons
# ✅ Connection refused - PostgREST not accessible!

curl http://localhost:4000/lessons -H "Authorization: Bearer <token>"
# ✅ Works through Express proxy!
```

---

## Implementation Steps for Option 2 (Full Isolation)

### 1. Create Dockerfile

```bash
# Save as: Dockerfile
```

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "dist/index.js"]
```

### 2. Update docker-compose.yml

Add Express service and remove PostgREST port mapping (see Option 2 above).

### 3. Update .env

```env
POSTGREST_URL=http://learning-platform-postgrest:3000
DB_HOST=postgres  # Use Docker service name
```

### 4. Build and Run

```bash
docker-compose down
docker-compose up --build -d
```

### 5. Verify

```bash
# Should fail (PostgREST blocked)
curl http://localhost:3001/lessons

# Should work (through Express)
curl http://localhost:4000/rpc/verify_login -X POST \
  -H "Content-Type: application/json" \
  -d '{"p_email":"admin@example.com","p_password":"admin123"}'
```

---

## Summary

| Option       | Express Location | PostgREST Access | Security Level | Use Case                 |
| ------------ | ---------------- | ---------------- | -------------- | ------------------------ |
| **Current**  | Host             | localhost:3001   | ❌ Low         | Can bypass Express       |
| **Option 1** | Host             | 127.0.0.1:3001   | ⚠️ Medium      | Still accessible locally |
| **Option 2** | Docker           | Internal only    | ✅ High        | Fully isolated           |

### Recommendation:

- **Development:** Use Option 1 with firewall rules (or accept the risk for dev)
- **Production:** Use Option 2 (Express in Docker) for complete isolation

---

## Why Current Setup Isn't Fully Blocked

```yaml
ports:
    - '3001:3000' # Maps container:3000 → host:3001
```

This means:

- ✅ Docker network can access: `http://learning-platform-postgrest:3000`
- ❌ Host machine can ALSO access: `http://localhost:3001`
- ❌ Anyone on your network can access: `http://your-ip:3001`

To fully block, you must either:

1. Remove the port mapping (Option 2)
2. Use firewall rules (Option 1)
3. Bind to 127.0.0.1 only: `"127.0.0.1:3001:3000"`

Choose based on your deployment needs!
