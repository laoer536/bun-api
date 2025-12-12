#!/bin/bash
set -e

# If there are no parameters passed, an error is reported and exit
if [ -z "$1" ]; then
  echo "❌ Error: Please pass in the env file to load, for example:"
  echo "   ./deploy.sh .env.deploy"
  exit 1
fi

ENV_FILE="$1"

# Check if the file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: File not found: $ENV_FILE"
  exit 1
fi

echo "🔧 Loading environment variable file: $ENV_FILE"

# Load the env file into the shell environment variable
set -a
source "$ENV_FILE"
set +a

# ------------------------
# 1. Build a mirror
# ------------------------
echo "📦 Building images..."
docker compose -f docker-compose.deploy.yml build
echo "⭕ Build completed."

# ------------------------
# 2. Run the migration（one-shot）
# ------------------------
echo "🗄️ Running Prisma migration..."
docker compose -f docker-compose.deploy.yml run --rm migrate
echo "⭕ Migration completed."

# ------------------------
# 3. Start the service
# ------------------------
echo "🚀 Starting services..."
docker compose -f docker-compose.deploy.yml up -d backend frontend
echo "✨ All services started successfully!"
