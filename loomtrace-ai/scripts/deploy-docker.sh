#!/bin/bash

# LoomTrace Docker Deployment Script
# Usage: ./scripts/deploy-docker.sh

set -e

echo "🐳 LoomTrace Docker Deployment Script"
echo "---"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ docker not found"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ docker-compose not found"; exit 1; }
echo -e "${GREEN}✓ Docker installed${NC}"

# Step 2: Check environment file
echo -e "${BLUE}[2/6]${NC} Checking environment file..."
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
  echo "Creating .env.local from .env.local.example..."
  cp .env.local.example .env.local
  echo -e "${YELLOW}✓ Please edit .env.local with your credentials and run again${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Environment file ready${NC}"

# Step 3: Build Docker image
echo -e "${BLUE}[3/6]${NC} Building Docker image..."
docker build -t loomtrace:latest .
echo -e "${GREEN}✓ Docker image built${NC}"

# Step 4: Stop existing containers
echo -e "${BLUE}[4/6]${NC} Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Old containers stopped${NC}"

# Step 5: Start with docker-compose
echo -e "${BLUE}[5/6]${NC} Starting containers with docker-compose..."
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"

# Step 6: Wait for health check
echo -e "${BLUE}[6/6]${NC} Waiting for app to be healthy..."
for i in {1..30}; do
  if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ App is healthy${NC}"
    break
  fi
  echo "  Attempt $i/30..."
  sleep 2
done

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop containers: docker-compose down"
echo "App URL: http://localhost:3000"
echo ""
