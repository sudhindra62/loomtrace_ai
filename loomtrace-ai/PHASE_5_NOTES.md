# Phase 5 — AI (Gemini), QR, DPI, LoomLens, Market Intelligence

**Status:** Complete for the core AI + verification pipeline.

## Built
- **Gemini client** (`lib/gemini/client.ts`) — server-only, single implementation for all three AI routes
- **Versioned prompts** (`lib/gemini/prompts.ts`) — grounding discipline enforced in the prompt text itself: price recommendations are given real comparable listings and instructed not to invent numbers when none exist
- **`/api/gemini/describe`, `/vision`, `/price-recommend`** — all Zod-validated, all write to `aiDecisions` via `logAiDecision()` (Responsible AI audit trail), vision route enforces a real 70%-confidence human-review threshold server-side (never trusts the model's own self-assessment alone)
- **Hash-chain utility** (`lib/qr/hash-chain.ts`) — closes the gap flagged in Phase 2; used by `appendLifecycleEvent()` and now wired into the `onUserCreate` Cloud Function too (functions package has its own copy, documented as the one deliberate duplication exception, justified by the Functions/Next.js packaging boundary)
- **Signed QR tokens** (`lib/qr/signing.ts`) — HMAC-signed verification URLs, prevents DPI-ID enumeration
- **`/api/passports/create`** — the actual DPI creation path: ownership check → snapshot doc → genesis lifecycle event (hash-chained) → QR generation/upload → second lifecycle event → product linked. One write path, nothing writes `productIdentities` directly from the client
- **Public verification page** (`/verify/[passportId]`) — real Server Component reading live Firestore via Admin SDK, validates the signed token, renders the lifecycle timeline, logs the scan — this is what a QR scan in the real world actually hits
- **`/weaver/products/new`** — the full weaver-facing flow: form → image upload (to the `uploadQueue` path from Phase 2's storage rules) → product creation → optional AI description, LoomLens (consent-gated), price guidance → DPI/QR issuance

## Deliberate constraint carried through every route
Every AI-generated number is grounded in real Firestore data queried *before* the Gemini call, never a bare model guess — this was a Phase 1 commitment (Rev 2 §4) and it's now an actual code pattern, not just documentation.

## Known gaps, stated honestly
- **Publish flow isn't wired yet** — a product created here stays in `draft` status; the `/weaver/products/[id]` detail page (edit, publish toggle, apply AI description to the live listing) isn't built. That's the natural next increment, not done here to avoid growing this phase further.
- **LoomLens human-review queue UI** doesn't exist yet — results below the confidence threshold are flagged (`reviewStatus: pending_human_review` in `aiDecisions`) but there's no government-side screen to act on that queue. Belongs with the Government dashboard's verification workflow, not bolted onto this phase.
- **Cluster/craft-type dropdowns are hardcoded** in the product form rather than reading from a real `clusters` collection — acceptable for now since cluster seeding is a data-population task, not an architecture one.

## Next: Phase 6 — Testing, Optimization, Accessibility, Performance, Security, Deployment, Documentation
