# Kế hoạch triển khai (Deploy Plan) Backend & Frontend

Tài liệu này mô tả quy trình triển khai production cho toàn bộ hệ thống (API + DB + PostgREST + Adminer tùy chọn + Frontend). Nội dung căn cứ vào các cấu hình hiện có:

- [api/Dockerfile](../api/Dockerfile)
- [api/docker-compose.yml](../api/docker-compose.yml)
- [api/package.json](../api/package.json)
- [ui/package.json](../ui/package.json)
- [ui/README.md](../ui/README.md)

## 1) Kiến trúc triển khai

- Backend (trong Docker):
    - PostgreSQL (dữ liệu persist qua volume).
    - PostgREST (nội bộ, không expose ra host).
    - Express API (expose cổng 4000 ra host).
    - Adminer (tùy chọn, expose 8080 — chỉ dùng tạm thời để quản trị).
- Frontend (khuyến nghị 1 trong 2):
    - Static hosting (Vercel/Netlify/S3+CloudFront/Nginx) — build ở CI/CD rồi deploy static files.
    - Dockerized Nginx phục vụ static build và reverse proxy đến API.

Networking:

- Mạng Docker bridge “internal” phục vụ nội bộ giữa các service (đã cấu hình trong [api/docker-compose.yml](../api/docker-compose.yml)).
- Chỉ Express (cổng 4000) và Adminer (cổng 8080, không nên mở public) được publish ra host.

## 2) Yêu cầu hạ tầng

- Máy chủ Linux (Ubuntu 22.04+), 2 vCPU, 4GB RAM tối thiểu (tùy tải).
- Docker Engine 24+ và Docker Compose plugin.
- Tên miền (domain) cho frontend (vd: app.example.com) và cho API (vd: api.example.com) nếu muốn tách.
- Cổng mở: 80/443 (nếu dùng reverse proxy HTTPS), 4000 (nếu truy cập API trực tiếp, không khuyến nghị public).

## 3) Chuẩn bị biến môi trường

- Backend (API):
    - Sao chép và điền file `.env` dựa trên `api/.env.example` (nếu có). Nếu không, dùng biến môi trường trực tiếp trong Compose (đã đặt sẵn trong [api/docker-compose.yml](../api/docker-compose.yml)):
        - DB_HOST=postgres
        - DB_PORT=5432
        - DB_NAME=learning_platform
        - DB_USER=postgres
        - DB_PASSWORD=postgres (Khuyến nghị: thay bằng secret thực tế; có thể chuyển sang Docker secrets)
        - POSTGREST_URL=http://learning-platform-postgrest:3000
        - PORT=4000
        - NODE_ENV=production

- Frontend (UI):
    - Sao chép `ui/.env.example` thành `.env` và điền các biến (ví dụ REACT_APP_API_URL hoặc VITE_API_URL tùy toolchain).
    - Với static build, biến môi trường được bake vào lúc build.

## 4) Triển khai Backend (DB + PostgREST + Express API)

Các file cốt lõi:

- Dockerfile đa stage sẵn: [api/Dockerfile](../api/Dockerfile)
- Compose production: [api/docker-compose.yml](../api/docker-compose.yml)

Bước thực hiện trên máy chủ:

1. Clone code và chuyển thư mục:
    ```sh
    cd api
    ```
2. Khởi chạy stack:
    ```sh
    docker compose -f docker-compose.yml up -d --build
    ```
3. Kiểm tra health:
    - API healthcheck: Dockerfile đã cấu hình kiểm tra HTTP GET đến /health. Đảm bảo route `/health` trả về 200.
    - Kiểm tra container:
        ```sh
        docker ps
        docker logs -f learning-platform-express
        docker logs -f learning-platform-db
        docker logs -f learning-platform-postgrest
        ```
4. Khởi tạo DB:
    - Compose đã mount `./resources/db/init` vào `/docker-entrypoint-initdb.d`. Các script .sql trong thư mục đó sẽ chạy lần đầu khi volume data trống.
    - Với các thay đổi schema sau này, hãy tạo script migration và chạy thủ công (hoặc dùng công cụ migration chuyên dụng).

Ghi chú bảo mật:

- Đổi mật khẩu DB mặc định “postgres/postgres” thành mật khẩu mạnh.
- Không nên giữ Adminer mở public. Nếu cần, bind Adminer chỉ trên localhost hoặc bảo vệ bằng firewall/Basic Auth, và tắt khi xong việc.

Backup/Restore:

- Backup:
    ```sh
    docker exec -t learning-platform-db pg_dump -U postgres learning_platform > backup_$(date +%F).sql
    ```
- Restore:
    ```sh
    cat backup.sql | docker exec -i learning-platform-db psql -U postgres -d learning_platform
    ```

Cập nhật (zero-downtime cơ bản):

- Build image mới rồi `docker compose up -d` (Compose sẽ recreate container API, giữ nguyên volume Postgres).
- Dùng healthcheck và `depends_on` đã có để đảm bảo thứ tự service.

## 5) Triển khai Frontend

Chọn 1 trong 2 hướng:

### Hướng A (Khuyến nghị): Static hosting (Vercel/Netlify/S3+CloudFront)

Build local/CI:

```sh
cd ui
npm ci
npm run build
# output: ui/dist (hoặc build tùy toolchain)
```

Triển khai:

- Vercel/Netlify: kết nối repo, set biến môi trường build, trỏ domain.
- S3+CloudFront:
    - Upload thư mục build (dist) lên S3 (static website hosting).
    - Tạo CloudFront distribution trỏ đến S3 origin, bật gzip/brotli.
    - Thiết lập domain và chứng chỉ ACM.

Kết nối API:

- Đặt biến môi trường frontend (vd VITE_API_URL=https://api.example.com) trước khi build.
- Với SPA, cấu hình “rewrite all” đến index.html tại CDN/hosting.

### Hướng B: Dockerized Nginx phục vụ static + reverse proxy tới API

1. Tạo Dockerfile cho UI (multi-stage: build bằng Node, serve bằng Nginx):

```dockerfile
// filepath: ui/Dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx config sẽ proxy /api -> Express
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

2. Cấu hình Nginx reverse proxy:

```nginx
// filepath: ui/nginx.conf
server {
  listen 80;
  server_name _;

  # Serve static
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri /index.html;
  }

  # Proxy API (giả định UI và API cùng mạng Docker; "learning-platform-express" là service name)
  location /api/ {
    proxy_pass http://learning-platform-express:4000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

3. Thêm service frontend vào Compose (cùng mạng với API):

```yaml
// filepath: api/docker-compose.yml
# ...existing code...
  frontend:
    build:
      context: ../ui
      dockerfile: Dockerfile
    container_name: learning-platform-frontend
    restart: unless-stopped
    ports:
      - "80:80"       # Phục vụ frontend qua HTTP
    depends_on:
      - express
    networks:
      - internal
# ...existing code...
```

Ghi chú:

- Nếu cần HTTPS, đặt một reverse proxy (Caddy/Traefik/Nginx) ở trước, terminate TLS và forward đến `frontend:80`. Caddy đơn giản cho Let's Encrypt tự động.

Ví dụ Caddy cho 1 domain tách API và FE:

```nginx
# Caddyfile (tham khảo)
app.example.com {
  reverse_proxy frontend:80
}
api.example.com {
  reverse_proxy express:4000
}
```

## 6) CI/CD (khuyến nghị)

- Build & Push images:
    - API: build từ [api/Dockerfile](../api/Dockerfile), tag và push vào registry (ghcr.io, Docker Hub).
    - UI: build từ `ui/Dockerfile`, push image.
- Deploy:
    - Máy chủ pull image mới và `docker compose up -d` (có thể chạy tự động qua SSH hoặc GitHub Actions self-hosted runner).

Ví dụ workflow rút gọn (API):

```yaml
name: api-ci
on:
    push:
        paths:
            - 'api/**'
        branches: [main]
jobs:
    build-and-push:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: docker/setup-buildx-action@v3
            - uses: docker/login-action@v3
              with:
                  registry: ghcr.io
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}
            - uses: docker/build-push-action@v6
              with:
                  context: api
                  push: true
                  tags: ghcr.io/OWNER/learning-platform-api:latest
```

Triển khai qua SSH (rút gọn):

```yaml
- name: Deploy
  uses: appleboy/ssh-action@v1.0.3
  with:
      host: ${{ secrets.HOST }}
      username: ${{ secrets.USER }}
      key: ${{ secrets.SSH_KEY }}
      script: |
          cd /opt/learning-platform/api
          docker compose pull
          docker compose up -d
          docker system prune -f
```

## 7) Vận hành & Giám sát

- Logs:
    ```sh
    docker logs -f learning-platform-express
    docker logs -f learning-platform-db
    docker logs -f learning-platform-postgrest
    docker logs -f learning-platform-frontend
    ```
- Tài nguyên:
    ```sh
    docker stats
    ```
- Nâng cấp DB minor:
    - Snapshot volume hoặc backup bằng `pg_dump`.
    - Test nâng cấp ở staging trước.

## 8) Checklist nhanh

- [ ] Thay mật khẩu DB mặc định.
- [ ] Tạo .env cho UI và API.
- [ ] Bật HTTPS (Caddy/Traefik/Nginx + Certbot).
- [ ] Đảm bảo route `/health` của API trả 200.
- [ ] Tắt Adminer hoặc hạn chế truy cập.
- [ ] Thiết lập backup định kỳ cho Postgres.
- [ ] Thiết lập CI/CD build & deploy.

## 9) Lệnh chạy nhanh (single host)

- Backend:
    ```sh
    cd api
    docker compose up -d --build
    ```
- Frontend (Dockerized Nginx):
    ```sh
    cd api
    docker compose up -d --build frontend
    ```

Tham khảo thêm trong:

- [api/docker-compose.yml](../api/docker-compose.yml)
- [api/Dockerfile](../api/Dockerfile)
- [ui/README.md](../ui/README.md)
- [ui/package.json](../ui/package.json)
- [api/package.json](../api/package.json)
