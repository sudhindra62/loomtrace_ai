# LoomTrace AI

National digital infrastructure for verifying authentic Indian handloom products, connecting weavers to real markets, and giving policymakers real-time visibility into the handloom economy. Built as a Ministry of Textiles digital public infrastructure concept.

## Documentation map

| Doc | Covers |
|---|---|
| `PHASE_1_ARCHITECTURE_V3.md` | Full system architecture, Firestore schema, Responsible AI framework, impact measurement, disaster recovery, vision |
| `docs/ARCHITECTURE_DECISIONS.md` | Why each major technical decision was made, alternatives considered, known gaps |
| `SECURITY.md` | Security posture, control-to-implementation mapping, known gaps |
| `docs/ACCESSIBILITY_CHECKLIST.md` | Manual a11y verification, complementing automated CI scans |
| `DEPLOYMENT.md` | Production setup, step by step |
| `PHASE_2` through `PHASE_5` `_NOTES.md` | What was built in each phase, and each phase's explicitly stated gaps |

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase + Gemini credentials
firebase login && firebase use --add
npm run emulators                  # terminal 1
npm run dev                        # terminal 2
```

## Testing

```bash
npm run test              # unit tests (Vitest) — pure logic: hash-chain, validation schemas
npm run test:integration  # Firestore security rules, against the emulator
npm run test:e2e          # Playwright — critical flows, mobile viewport included
npm run test:a11y         # axe-core WCAG 2.2 AA scan of key pages
```

## What's real vs. what's specified-but-not-built

This project was built in six phases, each with its own notes file stating gaps honestly rather than papering over them. The short version:

**Fully real, working code:** authentication (register/login/verify/forgot-password), RBAC (3-layer defense-in-depth), all four dashboards, public marketplace (browse + product detail + wishlist), weaver product publish/DPI-issuance flow, Gemini-powered description/vision/price-recommendation (server-only, audit-logged, rate-limited), DPI creation with hash-chained tamper-evident lifecycle events, signed QR generation and public verification, the nightly analytics rollup function that actually populates NHIC/Impact Dashboard data, security rules validated by emulator tests, CI/CD pipeline with a Lighthouse performance gate.

**Architecturally specified, not yet implemented:** the Early Warning System's alert-generation logic (rollups exist, alert-flagging thresholds don't yet), real full-text product search (client-side filter is a stated stopgap), the government-side LoomLens human-review queue, Export Readiness Layer and Digital Heritage Archive UI (schema/rules exist), SMS notifications (WhatsApp share links work today with zero backend needed).

See each phase's notes file for the specific reasoning behind what was and wasn't built at each stage — that reasoning is the actual deliverable as much as the code is.

## Tech stack
Next.js 15 (App Router, Server Components) · TypeScript · Tailwind CSS · Framer Motion · React Query · Firebase (Auth, Firestore, Storage, Cloud Functions) · Gemini API · Vitest + Playwright + axe-core · Vercel + Firebase Hosting
