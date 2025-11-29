#!/bin/bash

# Stop the script if any command fails
set -e

echo "🚀 Starting deployment..."

# 1. Navigate to the api directory
if [ -d "api" ]; then
    cd api
    echo "📂 Changed directory to api/"
else
    echo "❌ Error: 'api' directory not found."
    exit 1
fi

# 2. Pull the latest source code
echo "⬇️  Pulling latest code from Git..."
git pull 


echo "Building and restarting Express container..."
docker-compose -f docker-compose.yml up -d --build --no-deps express

# Optional: Clean up unused images to save disk space
docker image prune -f

echo "// filepath: deploy.sh
#!/bin/bash

# Stop the script if any command fails
set -e

echo "🚀 Starting deployment..."

# 1. Navigate to the api directory
if [ -d "api" ]; then
    cd api
    echo "📂 Changed directory to api/"
else
    echo "❌ Error: 'api' directory not found."
    exit 1
fi

# 2. Pull the latest source code
echo "⬇️  Pulling latest code from Git..."
git pull origin main
# Note: Change 'main' to 'master' or your specific branch name if different

# 3. Build and re-create the Express container
# We use --no-deps so Postgres/PostgREST don't restart
echo "🐳 Building and restarting Express container..."
docker-compose -f docker-compose.yml up -d --build --no-deps express

# Optional: Clean up unused images to save disk space
# docker image prune -f

echo "