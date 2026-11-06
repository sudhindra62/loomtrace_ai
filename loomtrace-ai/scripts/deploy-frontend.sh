#!/bin/bash

# LoomTrace Firebase Hosting Deployment Script
# Usage: ./scripts/deploy-frontend.sh [firebase-project-id]

set -e

PROJECT_ID=${1}

echo "📱 LoomTrace Frontend Deployment (Firebase Hosting)"
echo "---"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."
command -v firebase >/dev/null 2>&1 || { echo "❌ Firebase CLI not found"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm not found"; exit 1; }
echo -e "${GREEN}✓ Prerequisites met${NC}"

# Step 2: Install dependencies
echo -e "${BLUE}[2/5]${NC} Installing dependencies..."
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Build Next.js app
echo -e "${BLUE}[3/5]${NC} Building Next.js application..."
if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ .env.local not found${NC}"
  exit 1
fi
npm run build
echo -e "${GREEN}✓ Build successful${NC}"

# Step 4: Deploy to Firebase Hosting
echo -e "${BLUE}[4/5]${NC} Deploying to Firebase Hosting..."
if [ -z "$PROJECT_ID" ]; then
  firebase deploy --only hosting
else
  firebase deploy --only hosting --project=$PROJECT_ID
fi
echo -e "${GREEN}✓ Hosting deployment complete${NC}"

# Step 5: Show deployment info
echo -e "${BLUE}[5/5]${NC} Deployment complete!"
echo ""
firebase hosting:sites

echo ""
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo ""
echo "Your app is live at:"
firebase hosting:sites 2>/dev/null | head -5 || echo "  https://YOUR_PROJECT_ID.firebaseapp.com"
echo ""
