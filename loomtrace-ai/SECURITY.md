# Security

## Reporting a vulnerability
Do not open a public GitHub issue for security vulnerabilities. Email the security contact listed in the project's Firebase/Vercel dashboard owner record (populate before public launch).

## Posture summary (cross-referencing where each control is implemented)

| Control | Where |
|---|---|
| RBAC via server-set custom claims, never client-writable fields | `lib/firebase/admin.ts`, `firestore.rules`, ADR-002 |
| Defense-in-depth (edge middleware → Route Handler → security rules) | `src/middleware.ts`, `lib/firebase/session.ts` |
| Immutable, hash-chained audit trail for product/weaver history | `lib/qr/hash-chain.ts`, `lib/events/appendLifecycleEvent.ts`, ADR-003 |
| Signed, non-enumerable QR verification tokens | `lib/qr/signing.ts`, ADR-006 |
| Server-side re-validation of all client input (Zod) | every `app/api/**/route.ts` |
| Account-enumeration resistance on password reset | `features/auth/services/auth.service.ts` |
| No secrets in client bundles | `server-only` import guards on `lib/firebase/admin.ts`, `lib/gemini/client.ts`, `lib/qr/signing.ts` |
| Security headers (X-Frame-Options, nosniff, Permissions-Policy) | `next.config.js` |
| Rate limiting on AI/scan endpoints | `lib/security/rateLimit.ts`, applied to all three `/api/gemini/*` routes and the public `/verify/[passportId]` page |
| Dependency vulnerability scanning | `npm audit` — recommend adding Dependabot or Snyk before production |
| AI decision audit trail (Responsible AI) | `lib/ai/logAiDecision.ts`, `aiDecisions` collection |
| Firestore/Storage backup policy | Documented in Phase 1 Rev 3 §2 — requires manual GCP configuration (scheduled exports, PITR) at project setup time, not code |

## Known gaps before production
- **Rate limiting is a simple Firestore-transaction-based limiter**, not a distributed-systems-grade solution (small race window under heavy concurrent load, no sub-second precision). Sufficient to stop realistic abuse (scripted hammering); revisit with Upstash/Redis if traffic ever justifies the added infrastructure.
- **No penetration test has been performed.** Everything in this document describes the intended architecture; it is not a substitute for an independent security review, which a government platform handling economic identity data should undergo before launch.
- **Dependency scanning is not automated in CI.** Add a Dependabot config or `npm audit --audit-level=high` CI step (straightforward addition, not done in this pass to avoid noisy false-positive blocking of an otherwise-green pipeline without a triage process in place first).
