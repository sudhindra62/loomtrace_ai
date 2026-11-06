# Phase 2 — Authentication, Backend, Database, Security

**Status:** Complete for the scope below. This is real, runnable code (once `npm install` + Firebase project credentials are supplied) — not pseudocode.

## What's built

- **Firebase client/admin SDK setup** (`src/lib/firebase/`) — clean client/server split, admin credentials never reachable from browser bundles (`server-only` import guard)
- **Full auth flow**: register → email verification (enforced server-side, not just a UI screen) → login → forgot password → session establishment
- **Session strategy**: httpOnly cookie minted server-side from a verified Firebase ID token, not the ID token itself used as a session
- **RBAC, 3-layer defense-in-depth**: Edge middleware (coarse redirect) → Route Handler `requireRole()` (real verification) → Firestore Security Rules (backstop) — matches the architecture from Phase 1 Rev 2 §8
- **Custom-claims role model**: `firestore.rules` and all server checks trust `request.auth.token.role`, never a client-writable Firestore field
- **Privilege escalation is structurally blocked**, not just discouraged: public registration's Zod schema only allows `weaver`/`buyer`; the Cloud Function trigger that sets the actual claim re-enforces that; `government`/`admin` roles are only assignable via the admin-gated `/api/auth/set-role` route
- **Living Digital Identity seeding**: the `onUserCreate` trigger creates a weaver's `weaverIdentities/{uid}` document and first `identityEvents` entry at registration — the lifecycle starts immediately, not at some optional later step
- **Security rules** for every collection specified in Phase 1 (Rev 1–3), including append-only enforcement on `lifecycleEvents`/`identityEvents` and default-deny on anything unmatched
- **Tailwind design system** wired end-to-end: config → globals.css → root layout (fonts, metadata, skip link) → branded auth split-panel layout → 4 styled auth pages
- **Accessibility baseline**: skip link, visible focus rings (never suppressed), `prefers-reduced-motion` respected at the CSS layer

## Known gap, stated honestly

`identityEvents.eventHash` is written as `null` in the `onUserCreate` trigger — the actual hash-chaining utility (Phase 1 Rev 2 §8's tamper-evidence mechanism) is a shared piece of logic used by every lifecycle-event writer across the app (products, DPI, weaver identity, exports). Building it once, properly, alongside the first *product* lifecycle-event writer in the Phase 2 continuation is the right sequencing — building it in isolation here risked getting the interface wrong before seeing its real call sites.

## To actually run this

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase project config + the Gemini key you provided
firebase login
firebase use --add                 # select/create your Firebase project
npm run emulators                  # in one terminal
npm run dev                        # in another
```

Deploy rules/functions when ready:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules,functions
```

## Next: Phase 3 — Landing Page, Homepage, Animations, Graphics, Hero, Sections
This is where the "award-winning, Apple/Stripe/Linear-grade" visual bar gets built for real — hero, interactive India map teaser, feature sections, premium footer, scroll/micro-interactions layered on top of the design tokens already established in `tailwind.config.ts`.
