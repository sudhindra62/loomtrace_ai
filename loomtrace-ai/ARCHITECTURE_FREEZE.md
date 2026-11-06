# Architecture Synchronization & Freeze

**This document is now the single source of truth for naming, scope, and the BigQuery/rollup decision.** Phase 1 Rev 1–3 remain as historical record of the reasoning that led here; where they conflict with this document, this document wins. No further architecture expansion after this point — from here, all work is implementation against what's frozen below.

---

## 1. Terminology — Final, Locked

| Old / superseded | Final |
|---|---|
| AI Digital Product Passport | **Digital Product Identity (DPI)** |
| `productPassports` collection | `productIdentities` |
| LoomLens AI | **LoomLens AI Verification Engine** |
| Government Dashboard | **National Handloom Intelligence Center (NHIC)** |
| `passportId` (routes, params, fields) | `dpiId` |

**Code audit performed this pass** — found and fixed:
- `qrScans` composite index field `passportId` → `dpiId` (`firestore.indexes.json`)
- Public verification route `/verify/[passportId]` → `/verify/[dpiId]`, including the `qrScans` write inside it and the page component name
- `/api/passports/create` → `/api/dpi/create`, referenced from `useProductMutations.ts`
- Weaver dashboard nav link `/weaver/passports` → `/weaver/dpi`
- Marketing copy referencing "government dashboard" → "National Handloom Intelligence Center"

**Already correct, verified, no change needed:** `productIdentities` Firestore collection (was never actually called `productPassports` in code — only in early Rev 1 prose, already superseded), `firestore.rules` (uses `productIdentities` throughout), all Gemini route names, all component names (`AccessibleChart`, `DashboardShell`, etc.), `weaverIdentities` naming.

---

## 2. Locked Feature Scope — Final

This supersedes the Phase 1 "fewer features, fully real" trim list. Final scope, matching what Rev 2/3 architected:

1. **Digital Product Identity (DPI)** — event-sourced, hash-chained, QR-verified
2. **Verified Weaver Digital Identity** — mirrors DPI's event-sourced pattern for people
3. **National Handloom Intelligence Center (NHIC)** — heatmaps, forecasting, Early Warning System, Impact Dashboard
4. **AI Market Intelligence** — grounded decision-support engine
5. **LoomLens AI Verification Engine** — explainable, human-review-gated verification
6. **Export Readiness Layer** — architecturally specified (Phase 1 Rev 3 §6); not yet implemented in code, tracked below
7. **Digital Heritage Archive** — architecturally specified (Rev 3 §8); schema and rules exist (`heritageEntries`), UI not yet built, tracked below
8. **Impact Measurement Framework** — architecturally specified (Rev 3 §1); depends on the rollup pipeline decision in §3 below
9. **Responsible AI Framework** — **implemented**: consent gating, confidence thresholds, human-review routing, `aiDecisions` audit log all exist in code today

Mobile Studio, Global Marketplace Assistant, Scheme Eligibility Assistant, and standalone Heritage Story Experience remain roadmap items, not part of locked scope — unchanged from the original Phase 1 decision.

---

## 3. BigQuery — Resolved

**Decision: Option 2 — BigQuery is future-ready infrastructure. The MVP runs entirely on Firestore rollups.**

Chosen deliberately over "fully implement BigQuery" because standing up the export pipeline, rollup Cloud Functions, and BigQuery-backed queries is real new infrastructure work, not an architecture-consistency fix — out of place in a synchronization pass that's explicitly scoped to not add new major features.

What this means concretely, applied consistently everywhere it matters:
- **NHIC and the Impact Dashboard read `analyticsRollups` / `impactMetrics` documents in Firestore**, written by scheduled Cloud Functions (`functions/src/scheduled/`, not yet implemented — see `docs/ARCHITECTURE_DECISIONS.md`). This is sufficient for MVP and hackathon-demo scale.
- **BigQuery export via the Firestore extension remains documented as the scale-out path**, activated when Firestore-native rollups stop being sufficient (rough guideline: tens of millions of `qrScans`/`orders` documents, or analytical query patterns Firestore genuinely cannot express — arbitrary group-by, joins). Nothing in the current schema or rules blocks adding it later; no migration is required to switch.
- **ADR-001 in `docs/ARCHITECTURE_DECISIONS.md` is updated** to reflect this as the final decision, not an open question.

This is now a single, non-contradictory story across every phase document: Firestore rollups are the real MVP mechanism; BigQuery is noted as the future scale path, once, here — not re-litigated per-phase.

---

## 4. Future Government Ecosystem Integrations (Architecture Only)

Documented as attachment points, deliberately **not implemented** — each is a real integration project with its own auth model, sandbox environment, and compliance review, none of which belongs in MVP scope.

| Integration | Where it would attach | Why it's future-scoped, not MVP |
|---|---|---|
| **ONDC** (Open Network for Digital Commerce) | `products` + `orders` — a product published on LoomTrace could be listed as an ONDC seller catalog entry; DPI's verification status is exactly the kind of trust signal ONDC buyer apps want | Requires ONDC seller-network onboarding, a separate protocol adapter service, and its own compliance review — a real integration project, not a config flag |
| **DigiLocker** | `weaverIdentities` verification step — a weaver's government ID/certificates could be pulled via DigiLocker consent flow instead of manual document upload | Requires DigiLocker partner registration and a consent-based API integration; the current `verificationStatus` field and human-officer verification flow already work without it, so this is a UX upgrade, not a blocker |
| **Public APIs** | A read-only API surface over `products`, `productIdentities` (public fields only), and `heritageEntries` — for researchers, journalists, third-party apps | Needs API key management, usage quotas, and a Terms of Service — the Developer Portal below is the natural home for issuing these keys |
| **Partner APIs** | Authenticated, higher-rate-limit access for cooperatives/NGOs doing bulk operations (bulk product upload, bulk verification status checks) | Same prerequisites as Public APIs, plus a partner-agreement/vetting process that's an operational process as much as a technical one |
| **Webhooks** | Event triggers off `lifecycleEvents`, `orders`, and `interventionAlerts` writes — e.g., notify a cooperative's own system when one of their weavers' products gets verified | Natural fit once Cloud Functions triggers exist for these writes (some already do, e.g. `onUserCreate`) — the trigger infrastructure pattern is already in place, webhook *delivery* (retries, signing, a subscription-management UI) is the net-new work |
| **Developer Portal** | New `(dashboard)/developer/` area — API key issuance, usage dashboards, webhook subscription management | This is the natural home for Public/Partner API key management and webhook configuration once those exist; building the portal before the APIs it manages don't exist would be building UI for nothing |

**None of these require schema changes to adopt later** — `products`, `productIdentities`, and `weaverIdentities` are already public-readable where appropriate (see `firestore.rules`), which is what makes them viable API/ONDC/webhook sources without redesign when the time comes.

---

## 5. Synchronization Verification — Checklist

| Layer | Verified consistent |
|---|---|
| Firestore collections | ✅ `productIdentities`, `weaverIdentities`, `aiDecisions`, `heritageEntries` — all match Rev 3 naming |
| Firestore indexes | ✅ Fixed `passportId` → `dpiId` in `qrScans` index |
| API routes | ✅ `/api/dpi/create` (was `/api/passports/create`); `/api/gemini/*` already correctly named |
| Dynamic routes | ✅ `/verify/[dpiId]` (was `/verify/[passportId]`) |
| Dashboard nav | ✅ `/weaver/dpi` (was `/weaver/passports`); NHIC nav already correctly labeled in `government/layout.tsx` |
| Security rules | ✅ Already used `productIdentities` throughout — no change needed |
| Components | ✅ No stale naming found (`AccessibleChart`, `DashboardShell`, `NotificationBell`, etc. were never passport-named) |
| Marketing copy | ✅ Fixed one stray "government dashboard" reference in `TestimonialSection.tsx` |
| Documentation | ✅ This document is now authoritative; `docs/ARCHITECTURE_DECISIONS.md` ADR-001 updated to match §3 above |

---

## Architecture is now FROZEN.

No further architectural documents, revisions, or scope changes from this point. Everything from here forward is implementation work against what's specified in Phase 1 Rev 1–3, this synchronization pass, and `docs/ARCHITECTURE_DECISIONS.md` — building the production-ready, visually polished, fully functional platform on top of a now-consistent foundation.
