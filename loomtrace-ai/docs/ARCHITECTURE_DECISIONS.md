# Architecture Decision Records

Lightweight ADR log. Each entry: the decision, the alternatives considered, why this one won. Appended chronologically, never edited retroactively — if a decision is later reversed, that's a new entry, not a rewrite of history (the same immutability principle applied to the codebase in Phase 1 Rev 2 §8, applied here to the record of *why* the codebase looks the way it does).

---

### ADR-001: BigQuery is future-scale infrastructure; Firestore rollups run the MVP
**Decision:** NHIC and Impact Dashboard queries read `analyticsRollups`/`impactMetrics` documents written by scheduled Cloud Functions, entirely within Firestore. BigQuery export via the Firestore extension is documented as the scale-out path, not built for MVP.
**Alternatives considered:** Fully implementing the BigQuery pipeline now; querying Firestore directly with composite indexes (no rollups at all).
**Why this won:** Direct Firestore queries at analytical scale would work in a demo and fail at national scale — ruled out. Fully building BigQuery now is real new infrastructure (export pipeline, rollup functions, a second query layer) disproportionate to MVP needs. Firestore-native rollups are sufficient up to a real, statable scale (tens of millions of documents) and require zero schema migration to add BigQuery later.
**Status:** **Resolved and frozen** in `ARCHITECTURE_FREEZE.md` §3 (superseding the earlier ambiguity between Rev 2 and Rev 3 on this point). Rollup Cloud Functions themselves are not yet implemented — tracked as a known gap, not an open architecture question.

### ADR-002: Custom Auth claims, not Firestore fields, as the RBAC source of truth
**Decision:** `request.auth.token.role` is the only trusted role signal in security rules and server code. `users/{uid}.role` exists for display/query convenience only.
**Alternatives considered:** Storing role directly on the user document and checking it in rules.
**Why this won:** A Firestore field is client-writable unless explicitly locked down, and even then it's one rules mistake away from a privilege escalation. Custom claims can only be set server-side with the Admin SDK — structurally safer, not just carefully-guarded.
**Status:** Implemented (Phase 2).

### ADR-003: Event-sourced DPI (snapshot + append-only lifecycle events) instead of a single mutable document
**Decision:** `productIdentities/{id}` holds current-state; the real history lives in an immutable `lifecycleEvents` subcollection, hash-chained.
**Alternatives considered:** A single document with a growing array field; a single document with periodic full-document versioning.
**Why this won:** An array field isn't tamper-evident and doesn't scale to unbounded history. Document versioning duplicates the whole document per change. Event sourcing gives tamper-evidence (hash chain) and scales to arbitrarily long histories at the cost of an extra read for the timeline view — an acceptable tradeoff for a system whose entire value proposition is trustworthy history.
**Status:** Implemented (Phase 5).

### ADR-004: Hash-chaining duplicated (not shared) between the Next.js app and the Cloud Functions package
**Decision:** `src/lib/qr/hash-chain.ts` and `functions/src/lib/hashChain.ts` contain the same logic, maintained as two files.
**Alternatives considered:** A shared npm workspace package imported by both.
**Why this won:** A shared package is the "more correct" long-term answer, but introduces monorepo tooling (workspaces, build ordering) that wasn't justified for one ~15-line pure function at this stage. Documented as a deliberate, narrow exception to "no duplicated code" rather than an oversight — see the comment in `functions/src/lib/hashChain.ts`. **Revisit if this logic grows in complexity or a third consumer appears.**
**Status:** Implemented (Phase 5). Flagged for future consolidation.

### ADR-005: Client-side text search is a stopgap, not a real search implementation
**Decision:** Product search in the weaver dashboard filters already-loaded results client-side; there is no server-side full-text search.
**Alternatives considered:** Algolia, Typesense, Elasticsearch, Firestore's own limited prefix-matching via `searchKeywords[]`.
**Why this won:** None was implemented — this is an explicitly deferred decision, not a resolved one. The `searchKeywords[]` field exists in the schema (Phase 1) precisely so a real search layer can be added later without a schema migration. **This is a genuine gap for a production marketplace at scale and should be resourced before a public launch**, not treated as done.
**Status:** Deferred. Tracked as a known gap in Phase 5 notes.

### ADR-006: Signed QR tokens (HMAC) instead of unguessable random IDs alone
**Decision:** Verification URLs carry a server-derived HMAC token (`lib/qr/signing.ts`), checked before serving a DPI's public page.
**Alternatives considered:** Relying on Firestore auto-generated document IDs being unguessable; UUIDv4 document IDs.
**Why this won:** Unguessable-by-obscurity isn't a security property worth relying on for a government-operated verification system — an explicit signature is cheap to implement and gives an actual cryptographic guarantee, closing the "enumerate IDs to scrape unpublished products" concern named in Phase 1 Rev 2 §8 outright rather than reducing its likelihood.
**Status:** Implemented (Phase 5).

---

## Known gaps carried forward from earlier phases
- ~~Nightly rollup Cloud Functions~~ — **implemented** (`functions/src/scheduled/nightlyAnalyticsRollup.ts`): populates `analyticsRollups` and `impactMetrics` daily. Simple count-query aggregation, sufficient at MVP scale; revisit with write-time counters if collection scans get costly at higher volume. Requires `firebase deploy --only functions` to take effect — not yet deployed to any live project.
- Real full-text product search (ADR-005).
- SMS/WhatsApp notification delivery — WhatsApp share links work today (`wa.me`, no backend needed); SMS requires provisioning a licensed gateway, not yet integrated.
- Government-side LoomLens human-review queue UI (flagged in Phase 5 notes).
- Export Readiness Layer and Digital Heritage Archive — schema/rules exist, UI not yet built.
- Early Warning System scheduled function (interventionAlerts population) — not yet built; NHIC renders the alert feed correctly against empty data.
