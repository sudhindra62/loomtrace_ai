# Phase 4 — Dashboards (Weaver, Buyer, Government, Admin)

**Status:** Complete. One shared `DashboardShell` (role-aware sidebar/topbar/notifications) powers all four — no duplicated layout code.

## Built
- **Weaver**: overview (stats, recent products, guided empty state), products list (server-side filter/sort + infinite scroll + client-side search, honestly documented as a stopgap until real full-text search is added)
- **Buyer**: overview, wishlist (optimistic add/remove with rollback on failure)
- **Government (NHIC)**: real `AccessibleChart` component (chart + synchronized data-table toggle — enforces the Rev 3 §3 accessibility commitment structurally, not per-page), reads live from `analyticsRollups`/`interventionAlerts`, honest empty states since the nightly rollup Cloud Function isn't built yet
- **Admin**: users list with role management (routes through the admin-gated `/api/auth/set-role` endpoint, never a direct client write), audit log viewer

## Cross-cutting additions
- `requireRoleOrRedirect()` — Server Component-safe RBAC guard, separate from the Route Handler version (they can't share an implementation; documented why in code)
- `EmptyState`, `Skeletons`, `StatCard`, `NotificationBell` (live via `onSnapshot`) — shared, not duplicated per dashboard

## Known gap, stated honestly
Charts and stat cards showing "—" are querying real Firestore collections (`analyticsRollups`, `qrScans` aggregates) that stay empty until the nightly Cloud Function rollup pipeline from Phase 1 Rev 2 §5/§7 is actually built — that's scheduled-function work, not dashboard work, and belongs in a later pass rather than being faked here with hardcoded numbers.

## Next: Phase 5 — AI (Gemini), QR, DPI, LoomLens, Market Intelligence
