#!/bin/bash

# LoomTrace Deployment Script for VPS
# Usage: ./scripts/deploy-vps.sh your-domain.com

set -e

DOMAIN=${1:-your-domain.com}
APP_DIR="/app/loomtrace"

echo "🚀 LoomTrace VPS Deployment Script"
echo "Domain: $DOMAIN"
echo "---"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."
command -v git >/dev/null 2>&1 || { echo "❌ git not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node not found"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm not found"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ pm2 not found. Run: npm install -g pm2"; exit 1; }
echo -e "${GREEN}✓ All prerequisites met${NC}"

# Step 2: Create app directory
echo -e "${BLUE}[2/8]${NC} Setting up directories..."
mkdir -p $APP_DIR
mkdir -p /var/log/pm2
cd $APP_DIR
echo -e "${GREEN}✓ Directories ready${NC}"

# Step 3: Clone or pull repository
echo -e "${BLUE}[3/8]${NC} Updating repository..."
if [ -d ".git" ]; then
  git pull origin main
else
  echo "Repository not found, cloning from origin..."
  # Update this URL to your actual repository
  git clone https://github.com/your-org/loomtrace.git .
fi
echo -e "${GREEN}✓ Repository updated${NC}"

# Step 4: Check environment file
echo -e "${BLUE}[4/8]${NC} Checking environment variables..."
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found!"
  echo "Please create .env.local with your Firebase credentials:"
  echo "  1. Copy .env.local.example to .env.local"
  echo "  2. Fill in your Firebase credentials"
  echo "  3. Run this script again"
  exit 1
fi
echo -e "${GREEN}✓ Environment variables configured${NC}"

# Step 5: Install dependencies
echo -e "${BLUE}[5/8]${NC} Installing dependencies..."
npm ci
npm ci --prefix functions
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 6: Build application
echo -e "${BLUE}[6/8]${NC} Building application..."
npm run build
npm run build --prefix functions
echo -e "${GREEN}✓ Build successful${NC}"

# Step 7: Start/restart with PM2
echo -e "${BLUE}[7/8]${NC} Starting application with PM2..."
pm2 delete loomtrace 2>/dev/null || true
pm2 start ecosystem.config.js --name loomtrace
pm2 save
echo -e "${GREEN}✓ Application started${NC}"

# Step 8: Setup nginx (optional)
echo -e "${BLUE}[8/8]${NC} Nginx configuration..."
if command -v nginx >/dev/null 2>&1; then
  echo "Nginx detected. Update your nginx config:"
  echo "  1. Edit: /etc/nginx/sites-available/loomtrace"
  echo "  2. Replace 'your-domain.com' with: $DOMAIN"
  echo "  3. Run: sudo ln -s /etc/nginx/sites-available/loomtrace /etc/nginx/sites-enabled/"
  echo "  4. Test: sudo nginx -t"
  echo "  5. Reload: sudo systemctl reload nginx"
else
  echo "⚠️  Nginx not installed. Install with: sudo apt-get install nginx"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Status: pm2 status"
echo "Logs: pm2 logs"
echo "App URL: https://$DOMAIN"
echo ""
