# Deployment Guide

## Prerequisites
- A Firebase project (Blaze plan — required for Cloud Functions and outbound network calls from Functions)
- A Vercel account (or Firebase Hosting, if preferred — see note at the end)
- A Gemini API key
- Node 20+

## 1. Firebase project setup
```bash
firebase login
firebase use --add          # link this repo to your Firebase project
```

Enable in the Firebase Console before first deploy:
- Authentication → Email/Password provider
- Firestore → Native mode, choose a multi-region location close to India (asia-south1-based)
- Storage → default bucket, multi-region (per Phase 1 Rev 3 §2 — regional-only is not acceptable for this platform's public media)

Configure backups (console, not code — see `docs/ARCHITECTURE_DECISIONS.md` and Phase 1 Rev 3 §2):
- Firestore → Backups → daily scheduled export, 35-day retention
- Firestore → enable Point-in-Time Recovery (7-day window)

## 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in:
- Firebase client config (Console → Project Settings → General → Your apps)
- Firebase Admin credentials (Console → Project Settings → Service Accounts → Generate new private key)
- `GEMINI_API_KEY`
- `SESSION_COOKIE_SECRET` — generate with `openssl rand -hex 32`
- `NEXT_PUBLIC_APP_URL` — your production URL (needed for correct QR verification links)

## 3. Deploy Firebase backend
```bash
npm ci --prefix functions && npm run build --prefix functions
firebase deploy --only firestore:rules,firestore:indexes,storage:rules,functions
```
The `.github/workflows/deploy-firebase.yml` workflow automates this on push to `main` when rules/functions files change — requires `FIREBASE_TOKEN` (from `firebase login:ci`) and `FIREBASE_PROJECT_ID` as repo secrets.

## 4. Deploy the Next.js app to Vercel
Connect the repo in the Vercel dashboard (simplest — no CLI/token needed in CI). Set all the same environment variables from step 2 in Vercel's Project Settings → Environment Variables, scoped to Production.

Vercel auto-detects Next.js 15; no custom build command needed.

## 5. Post-deploy verification
- [ ] Register a test account, confirm the verification email arrives and the flow completes
- [ ] Create a test weaver product, generate its DPI, scan the resulting QR — confirm the public `/verify/[id]` page loads and the scan is logged
- [ ] Confirm an unauthenticated visitor is redirected away from `/weaver`, `/buyer`, `/government`, `/admin`
- [ ] Run `npm run test:a11y` against the production URL
- [ ] Run Lighthouse against the production URL, confirm scores match the `lighthouserc.json` budget

## Alternative: Firebase Hosting instead of Vercel
The brief lists both as deployment targets. Firebase Hosting can serve a Next.js app via its native Next.js integration (`firebase.json` → `hosting.source`), but as of this writing Firebase's Next.js support has more limitations around App Router Server Components/streaming than Vercel's first-party support. **Recommendation: Vercel for the app, Firebase for Auth/Firestore/Storage/Functions** (the architecture throughout this project already assumes this split) — stated plainly here rather than pretending both options are equally mature, since picking wrong costs real migration time later.
