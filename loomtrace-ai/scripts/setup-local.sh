#!/bin/bash

# LoomTrace Local Development Setup
# Usage: ./scripts/setup-local.sh

set -e

echo "🛠️  LoomTrace Local Development Setup"
echo "---"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org/"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm not found"; exit 1; }
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo -e "${GREEN}✓ Prerequisites met${NC}"

# Step 2: Setup environment
echo -e "${BLUE}[2/5]${NC} Setting up environment..."
if [ ! -f ".env.local" ]; then
  echo "Creating .env.local..."
  cp .env.local.example .env.local
  echo -e "${YELLOW}⚠️  Created .env.local${NC}"
  echo -e "${YELLOW}⚠️  Update it with your Firebase credentials:${NC}"
  echo "  - Get NEXT_PUBLIC_* keys from Firebase Console → Project Settings"
  echo "  - Get FIREBASE_ADMIN_* keys from Service Accounts"
  echo "  - Get GEMINI_API_KEY from https://makersuite.google.com"
  echo "  - Generate SESSION_COOKIE_SECRET: openssl rand -hex 32"
  echo ""
  echo "Then run: npm install"
  exit 1
fi
echo -e "${GREEN}✓ .env.local ready${NC}"

# Step 3: Install dependencies
echo -e "${BLUE}[3/5]${NC} Installing dependencies..."
npm ci
npm ci --prefix functions
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Check Firebase CLI
echo -e "${BLUE}[4/5]${NC} Checking Firebase CLI..."
if ! command -v firebase >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing Firebase CLI...${NC}"
  npm install -g firebase-tools
fi
echo -e "${GREEN}✓ Firebase CLI ready${NC}"

# Step 5: Summary
echo -e "${BLUE}[5/5]${NC} Setup complete!"
echo ""
echo -e "${GREEN}✅ Ready to develop!${NC}"
echo ""
echo "To start development in two terminals:"
echo ""
echo "Terminal 1 (Emulators):"
echo "  npm run emulators"
echo ""
echo "Terminal 2 (Next.js app):"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Testing:"
echo "  npm run test              # Unit tests"
echo "  npm run test:integration  # Integration tests"
echo "  npm run test:e2e          # E2E tests"
echo ""
