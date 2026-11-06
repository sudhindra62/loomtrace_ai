# 🚀 Production Deployment Guide

This document covers deploying LoomTrace to a live host server with both frontend and backend running together.

## Quick Start Paths

### ⚡ Fastest: Firebase Hosting + Cloud Functions
**Time: 10-15 minutes**
```bash
# 1. Setup Firebase project and get credentials
firebase login
firebase use --add

# 2. Create .env.local with credentials
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# 3. Deploy everything
npm run deploy:firebase
npm run deploy:frontend

# Done! Your app is live at: https://your-project.firebaseapp.com
```

### 🐳 Fast: Docker + Cloud Run
**Time: 20-30 minutes**
```bash
# 1. Create .env.local with credentials
cp .env.local.example .env.local
# Edit with your Firebase credentials

# 2. Build and start with Docker Compose
npm run deploy:docker

# Done! Your app is live at: http://localhost:3000
```

### 🖥️ Self-Hosted: VPS (DigitalOcean, AWS EC2, Linode, Hetzner)
**Time: 45-60 minutes + VPS setup**
```bash
# From your VPS:
./scripts/deploy-vps.sh your-domain.com

# Done! Your app is live at: https://your-domain.com
```

---

## Prerequisites

### All Deployments
- Node.js 20+ installed
- npm package manager
- Firebase project with Blaze plan (required for Cloud Functions)
- Firebase CLI: `npm install -g firebase-tools`

### Firebase Deployment Only
- Firebase credentials (see below)
- Gemini API key (optional, for AI features)

### VPS Deployment Only
- Linux VPS with sudo access (Ubuntu 20.04+ recommended)
- Domain name
- SSH access to server

### Docker Deployment Only
- Docker & Docker Compose installed

---

## Setup: Get Your Credentials

### Step 1: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing
3. Enable Blaze plan (required for Cloud Functions)

### Step 2: Get Firebase Client SDK Keys

1. Firebase Console → Project Settings → General
2. Under "Your apps" section, select your web app
3. Copy these values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```

### Step 3: Get Firebase Admin Credentials

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. A JSON file downloads - copy these values:
   ```
   FIREBASE_ADMIN_PROJECT_ID (from projectId)
   FIREBASE_ADMIN_CLIENT_EMAIL (from client_email)
   FIREBASE_ADMIN_PRIVATE_KEY (from private_key - include \n as literal text)
   ```

### Step 4: Other Credentials

Get from:
- **GEMINI_API_KEY**: https://makersuite.google.com/app/apikey
- **SESSION_COOKIE_SECRET**: 
  ```bash
  openssl rand -hex 32
  ```
- **NEXT_PUBLIC_APP_URL**: Your final URL (e.g., https://yourdomain.com)

### Step 5: Create .env.local

```bash
cp .env.local.example .env.local
# Edit file and paste all credentials above
```

---

## Deployment Option 1: Firebase Hosting + Cloud Functions

### Setup (One-time)
```bash
# Login to Firebase
firebase login

# Select your project
firebase use --add
```

### Configuration
```bash
# Create .env.local
cp .env.local.example .env.local
# Edit and fill in all credentials

# Update firebase.json if needed (usually pre-configured)
cat firebase.json
```

### Deploy
```bash
# Option A: Use npm script
npm run deploy:firebase
npm run deploy:frontend

# Option B: Manual commands
firebase deploy --only functions,firestore:rules,storage:rules
firebase deploy --only hosting
```

### Verify
```bash
# View deployment
firebase deploy --only hosting

# View logs
firebase functions:log
```

### Your URLs
- **Frontend**: https://your-project-id.firebaseapp.com
- **Functions**: https://region-your-project-id.cloudfunctions.net/
- **Custom domain**: Add in Firebase Console → Hosting → Domain

**Cost**: ~$5-50/month (depends on usage)

---

## Deployment Option 2: Docker + Any Cloud Provider

### Build Image
```bash
# Create .env.local first
cp .env.local.example .env.local
# Edit with credentials

# Build
docker build -t loomtrace:latest .
```

### Run Locally (Test)
```bash
docker-compose up -d
# App runs at http://localhost:3000
```

### Deploy to Cloud Run (Google Cloud)
```bash
# Configure gcloud
gcloud config set project PROJECT_ID
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/PROJECT_ID/loomtrace:latest .
docker push gcr.io/PROJECT_ID/loomtrace:latest

# Deploy
gcloud run deploy loomtrace \
  --image gcr.io/PROJECT_ID/loomtrace:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_FIREBASE_API_KEY=...
```

### Deploy to Docker Hub Registry
```bash
# Tag image
docker tag loomtrace:latest yourname/loomtrace:latest

# Push
docker push yourname/loomtrace:latest

# Deploy from any cloud provider using the image
```

**Cost**: ~$0-50/month (Cloud Run has free tier)

---

## Deployment Option 3: Self-Hosted VPS

### VPS Requirements
- Ubuntu 20.04 LTS or later
- 2GB RAM minimum, 10GB SSD
- Domain name pointing to server IP

### Providers (Recommended)
- DigitalOcean ($5/month basic)
- Hetzner (~€4/month basic)
- Linode ($6/month basic)
- AWS EC2 (variable pricing)

### Setup VPS (Ubuntu)

```bash
# 1. SSH into VPS
ssh root@your_server_ip

# 2. Update system
apt-get update && apt-get upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# 4. Install PM2 (process manager)
npm install -g pm2

# 5. Install Nginx
apt-get install -y nginx

# 6. Install Certbot (for HTTPS)
apt-get install -y certbot python3-certbot-nginx

# 7. Clone repository
git clone https://github.com/your-org/loomtrace.git /app/loomtrace
cd /app/loomtrace
```

### Deploy Application
```bash
# 1. Create .env.local with credentials
nano .env.local
# Paste all environment variables

# 2. Run deployment script
bash scripts/deploy-vps.sh your-domain.com

# Or manually:
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Setup Domain & HTTPS
```bash
# 1. Point domain DNS to VPS IP
# (Do this in your domain registrar)

# 2. Update nginx config
nano /etc/nginx/sites-available/loomtrace
# Change "your-domain.com" to your actual domain

# 3. Enable site
ln -s /etc/nginx/sites-available/loomtrace /etc/nginx/sites-enabled/

# 4. Get SSL certificate
certbot certonly --nginx -d your-domain.com

# 5. Update nginx config with certificate paths and reload
systemctl reload nginx
```

### Verify
```bash
# Check app status
pm2 status

# View logs
pm2 logs

# Check Nginx
nginx -t && systemctl restart nginx

# Test HTTPS
curl https://your-domain.com
```

**Cost**: ~$5-20/month

---

## Post-Deployment Verification

### For All Deployments
```bash
# 1. Homepage loads
curl https://your-domain.com

# 2. Can register account
# Use website to create test account

# 3. Can login
# Verify email and login works

# 4. Can create product (if weaver)
# Create test product

# 5. Database connection works
# Check data in Firebase Console
```

### Performance Check
```bash
# Run Lighthouse audit
npm run test:a11y -- https://your-domain.com

# Check scores against lighthouserc.json
cat lighthouserc.json
```

---

## Monitoring & Maintenance

### Firebase Monitoring
```bash
# View function logs
firebase functions:log --limit 50

# View error reporting
firebase deploy -- only functions --debug
```

### VPS Monitoring
```bash
# SSH into server
ssh root@your_server_ip

# Check app status
pm2 status
pm2 logs loomtrace

# Check system resources
top  # or: htop (if installed)

# Check disk space
df -h

# Check logs
journalctl -xe
```

### Docker Monitoring
```bash
# Check container status
docker ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Automated Backups

#### Firebase (Automatic)
- Enable daily backups in Firebase Console
- Point-in-Time Recovery: 7 days

#### VPS (Manual)
```bash
# Create backup script
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz /app/loomtrace/.next /app/loomtrace/node_modules
scp backup-*.tar.gz your-backup-server:/backups/
```

---

## Troubleshooting

### "Functions deployment failed"
```bash
# Check quota and error
firebase functions:describe
firebase deploy --only functions --debug

# Ensure Blaze plan is active
firebase plan:list
```

### "App won't start on VPS"
```bash
# Check logs
pm2 logs loomtrace

# Check .env.local exists
cat /app/loomtrace/.env.local

# Check Node version
node --version  # Should be 20+

# Restart
pm2 restart loomtrace
```

### "HTTPS certificate issues"
```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --force-renewal

# Check nginx config
nginx -t

# Check firewall
sudo ufw status
```

### "High Memory/CPU Usage"
```bash
# Monitor processes
pm2 monit

# Increase memory limit in ecosystem.config.js
# Restart app
pm2 restart loomtrace

# Check for memory leaks in logs
pm2 logs --lines 100
```

---

## Scaling & Performance

### Firebase Scaling
- Automatic: No action needed
- Monitor: Firebase Console → Functions → Metrics
- Limits: Check quotas at Firebase Console → Quotas

### VPS Scaling
- **Vertical**: Increase server resources (CPU, RAM)
- **Horizontal**: Load balance multiple servers with Nginx
- Monitor with `pm2 monit` or third-party tools

### Optimization
```bash
# Enable caching in nginx.conf
# Already configured for:
# - Static assets (1 year)
# - Images (30 days)
# - API routes (no cache)

# Monitor performance
npm run test:a11y -- https://your-domain.com

# Check bundle size
npm run build -- --analyze
```

---

## Security Checklist

- [ ] .env.local is in .gitignore (never commit)
- [ ] Firebase security rules deployed
- [ ] HTTPS enabled (not HTTP)
- [ ] SESSION_COOKIE_SECRET is strong (32+ bytes)
- [ ] CORS properly configured
- [ ] Admin endpoints authenticated
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Regular security audits scheduled

---

## Emergency Procedures

### Rollback to Previous Version
```bash
# Firebase Hosting
firebase hosting:channels:delete [channel-id]

# VPS
pm2 restart loomtrace --update-env
# Or restore from backup:
tar -xzf backup-YYYYMMDD.tar.gz
pm2 restart loomtrace
```

### Emergency DNS Failover
```bash
# Update domain DNS A record to point to backup server
# Or use Firebase Hosting as backup:
firebase deploy --only hosting
```

### Database Recovery
```bash
# Firebase provides automatic backups
# Restore from Firestore backups via console
# For VPS, restore from manual backups
```

---

## Support & Resources

- Firebase Docs: https://firebase.google.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Docker Docs: https://docs.docker.com/
- Nginx Docs: https://nginx.org/en/docs/
- PM2 Docs: https://pm2.keymetrics.io/

---

## Cost Comparison

| Option | Monthly | Setup Time | DevOps | Scaling |
|--------|---------|-----------|--------|---------|
| Firebase | $5-50 | 10 min | None | Auto |
| Docker/Cloud Run | $0-50 | 20 min | Minimal | Auto |
| VPS | $5-20 | 60 min | Self | Manual |

Choose based on your needs and comfort level with DevOps.

---

**Last Updated**: 2026-07-21
**Project**: LoomTrace AI
