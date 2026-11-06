#!/bin/bash

# LoomTrace Firebase Deployment Script
# Usage: ./scripts/deploy-firebase.sh

set -e

echo "🔥 LoomTrace Firebase Deployment Script"
echo "---"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7]${NC} Checking prerequisites..."
command -v firebase >/dev/null 2>&1 || { echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node not found"; exit 1; }
echo -e "${GREEN}✓ Prerequisites met${NC}"

# Step 2: Check Firebase configuration
echo -e "${BLUE}[2/7]${NC} Checking Firebase configuration..."
if [ ! -f "firebase.json" ]; then
  echo "❌ firebase.json not found"
  exit 1
fi
echo -e "${GREEN}✓ Firebase config found${NC}"

# Step 3: Check if logged in
echo -e "${BLUE}[3/7]${NC} Checking Firebase authentication..."
firebase projects:list >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️  Not logged into Firebase${NC}"
  echo "Run: firebase login"
  exit 1
}
echo -e "${GREEN}✓ Authenticated${NC}"

# Step 4: Check environment file
echo -e "${BLUE}[4/7]${NC} Checking environment variables..."
if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ .env.local not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Environment variables ready${NC}"

# Step 5: Build functions
echo -e "${BLUE}[5/7]${NC} Building Cloud Functions..."
cd functions
npm ci
npm run build
cd ..
echo -e "${GREEN}✓ Functions built${NC}"

# Step 6: Deploy
echo -e "${BLUE}[6/7]${NC} Deploying to Firebase..."
echo "Deploying:"
echo "  • Firestore rules"
echo "  • Firestore indexes"
echo "  • Storage rules"
echo "  • Cloud Functions"
echo ""

firebase deploy \
  --only firestore:rules,firestore:indexes,storage:rules,functions

echo -e "${GREEN}✓ Firebase deployment complete${NC}"

# Step 7: Show deployment info
echo -e "${BLUE}[7/7]${NC} Deployment information..."
echo ""
echo "Cloud Functions endpoints:"
firebase functions:describe
echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy frontend: ./scripts/deploy-frontend.sh"
echo "  2. View logs: firebase functions:log"
echo "  3. Monitor: firebase console"
echo ""
