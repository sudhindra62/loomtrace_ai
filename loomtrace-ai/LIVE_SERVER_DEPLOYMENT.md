# Live Server Deployment Guide

This guide covers deploying LoomTrace with both frontend and backend on a live host server.

## Architecture Overview

- **Frontend**: Next.js application (Node.js runtime)
- **Backend**: Firebase Cloud Functions (serverless)
- **Database**: Firebase Firestore (managed service)
- **Authentication**: Firebase Auth (managed service)
- **File Storage**: Firebase Storage (managed service)

## Deployment Options

### Option 1: Firebase Hosting + Cloud Functions (Recommended)
**Best for**: Serverless, auto-scaling, zero DevOps
- Frontend: Firebase Hosting (CDN + edge caching)
- Backend: Cloud Functions (auto-scaling)
- Database: Firestore (managed)
- Deployment time: 5-15 minutes

### Option 2: Single VPS (DigitalOcean, AWS EC2, Linode, Hetzner)
**Best for**: Full control, custom domain, on-premise requirements
- Frontend & Backend: Node.js on single server
- Database: Firebase (managed) or self-hosted
- Deployment time: 30-60 minutes + infrastructure setup

### Option 3: Docker + Cloud Run
**Best for**: Container-based deployment with auto-scaling
- Frontend: Cloud Run container
- Backend: Cloud Functions
- Database: Firestore (managed)
- Deployment time: 15-30 minutes

---

## Step 1: Firebase Project Setup

### Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- Node.js 20+
- A Google account with billing enabled

### 1.1 Create/Link Firebase Project
```bash
firebase login
firebase use --add
# Select your Firebase project or create a new one
```

### 1.2 Enable Required Services
In Firebase Console:
1. **Authentication**: Enable Email/Password provider
   - Console → Authentication → Sign-in method → Email/Password
   
2. **Firestore**: Create database
   - Console → Firestore Database → Create Database
   - Select multi-region location (asia-south1 for India)
   - Start in production mode
   
3. **Storage**: Create default bucket
   - Console → Storage → Get Started
   - Accept default settings (multi-region)
   
4. **Cloud Functions**: Enable API
   - Console → APIs & Services → Enable Cloud Functions API

### 1.3 Get Firebase Credentials
```bash
# Create .env.local file in project root
cp .env.local.example .env.local
```

Fill in `.env.local` with:

**From Firebase Console → Project Settings → General:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**From Firebase Console → Project Settings → Service Accounts:**
1. Click "Generate New Private Key"
2. Copy credentials:
```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your_key...\n-----END PRIVATE KEY-----\n
```

**Other variables:**
```
GEMINI_API_KEY=your_gemini_api_key  # Get from https://makersuite.google.com
SESSION_COOKIE_SECRET=<generate: openssl rand -hex 32>
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Your live server domain
NODE_ENV=production
```

---

## Step 2: Deploy Backend (Cloud Functions)

### 2.1 Build Functions
```bash
cd functions
npm install
npm run build
cd ..
```

### 2.2 Deploy Functions
```bash
firebase deploy --only functions
# Wait for deployment to complete
# Note the function endpoints printed in console
```

### 2.3 Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

---

## Step 3: Deploy Frontend

### Option 3A: Firebase Hosting (Quickest)

```bash
# Build Next.js app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.web.app`

### Option 3B: Vercel (Recommended for Next.js)

1. Connect GitHub repo to Vercel dashboard
2. Set environment variables in Vercel Project Settings:
   - Add all variables from `.env.local` (both NEXT_PUBLIC_* and server-only)
3. Vercel auto-detects Next.js and deploys on push to `main`

Your app will be live at: `https://your-project.vercel.app` or your custom domain

### Option 3C: Custom VPS (Node.js Server)

#### 3C.1 Server Setup
```bash
# SSH into your VPS
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Create app directory
mkdir -p /app/loomtrace
cd /app/loomtrace
```

#### 3C.2 Clone & Build
```bash
# Clone your repository
git clone https://github.com/your-org/loomtrace.git .

# Install dependencies
npm ci

# Create .env.local with all credentials
nano .env.local
# Paste your environment variables

# Build Next.js
npm run build
```

#### 3C.3 Start Application with PM2
```bash
# Create ecosystem file (see: ecosystem.config.js)
pm2 start ecosystem.config.js

# Save PM2 startup
pm2 startup
pm2 save
```

#### 3C.4 Configure Nginx Reverse Proxy
```bash
sudo apt-get install -y nginx

# Create nginx config (see: nginx.conf)
sudo nano /etc/nginx/sites-available/loomtrace

# Enable site
sudo ln -s /etc/nginx/sites-available/loomtrace /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### 3C.5 Setup SSL/HTTPS with Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 4: Verify Deployment

### 4.1 Test Frontend
```bash
curl https://your-domain.com
# Should return HTML with your app
```

### 4.2 Test Backend Functions
```bash
# Check Cloud Functions are running
firebase functions:describe

# Test an API endpoint
curl https://your-region-your-project.cloudfunctions.net/api/health
```

### 4.3 Test Database Connection
- Log in with test account
- Create test product
- Verify it appears in Firestore Console

### 4.4 Run Lighthouse Audit
```bash
npm run test:a11y -- https://your-domain.com
```

---

## Step 5: Monitoring & Maintenance

### Monitor Functions
```bash
# View logs
firebase functions:log

# Monitor in console
firebase-admin console  # or use Firebase Console UI
```

### Monitor Node.js App (VPS)
```bash
# View PM2 status
pm2 status

# View logs
pm2 logs

# Monitor performance
pm2 monit
```

### Set Up Alerts
- Firebase Console → Functions → Error Reporting
- Firebase Console → Firestore → Metrics
- Nginx/Certbot automatic renewal

---

## Troubleshooting

### Functions Deployment Fails
```bash
# Check quota
firebase functions:describe

# View error logs
firebase functions:log --limit 20

# Redeploy with verbose output
firebase deploy --only functions --debug
```

### App Won't Start
```bash
# Check Node version
node --version

# Check environment variables
cat /app/loomtrace/.env.local

# Check PM2 logs
pm2 logs --lines 50
```

### Database Connection Errors
```bash
# Verify Firebase credentials
firebase auth:export

# Test Firestore rules
firebase emulators:start --only firestore
```

---

## Environment Variables Checklist

Required for production:
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID
- [ ] FIREBASE_ADMIN_PROJECT_ID
- [ ] FIREBASE_ADMIN_CLIENT_EMAIL
- [ ] FIREBASE_ADMIN_PRIVATE_KEY
- [ ] GEMINI_API_KEY
- [ ] SESSION_COOKIE_SECRET
- [ ] NEXT_PUBLIC_APP_URL
- [ ] NODE_ENV=production

---

## Quick Start Commands

### Firebase Hosting (Fastest)
```bash
npm run build
firebase deploy
```

### Vercel
```bash
# Push to main, Vercel auto-deploys
git push origin main
```

### Custom VPS
```bash
ssh root@your_server_ip
cd /app/loomtrace
git pull
npm ci
npm run build
pm2 restart app
```

---

## Next Steps

1. Choose deployment option (Firebase, Vercel, or VPS)
2. Set up Firebase project and credentials
3. Deploy backend (Cloud Functions)
4. Deploy frontend (your chosen platform)
5. Verify all services are working
6. Monitor logs and performance
7. Set up automated backups and alerts
