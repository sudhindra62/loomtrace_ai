# Phase 3 — Landing Page, Homepage, Animations, Graphics, Hero, Sections

**Status:** Complete for the marketing/homepage scope.

## What's built

- **Hero** — animated gradient lighting, subtle woven-pattern SVG motif (crafted, not a stock photo — keeps the "no placeholder images" requirement honest), staggered headline/CTA entrance, a floating DPI verification-card mockup that gives a concrete product glimpse instead of only marketing copy, live stat chips
- **FeatureGrid** — the six locked flagship features (Rev 2/3 naming used consistently: Digital Product Identity, LoomLens AI Verification Engine, AI Market Intelligence, National Handloom Intelligence Center, QR verification, Verified Weaver Identity), hover-lift micro-interaction
- **LifecycleTimeline** — visualizes the "Living Digital Identity" concept from the architecture as an actual timeline, not just a claim in copy
- **TestimonialSection** — three realistic, cluster-accurate fictional weaver personas (Banarasi/Varanasi, Ikat/Pochampally, Jamdani/Nadia) — explicitly commented in code as composite demo personas, not real individuals, so this doesn't get mistaken for real endorsements later
- **CTASection**, **Navbar** (sticky, glass-on-scroll, mobile menu), **Footer** (government-appropriate: grievance redressal, RTI, accessibility statement links)
- **Dark mode**, fully wired: `next-themes` provider, hydration-safe `ThemeToggle`, respects system preference by default
- **Motion discipline**: every animated component reads from `lib/motion.ts` (no duplicated variant definitions) and the Hero's decorative mockup animation is skipped entirely under `prefers-reduced-motion` via `useReducedMotionSafe()` — accessibility carried through from Phase 1, not bolted on

## Deliberate restraint

Per "don't overuse animations": no parallax-on-scroll, no 3D tilt, no Three.js on this page. The brief asked for those tools "where useful" — a marketing homepage about verifying textile authenticity doesn't need a 3D scene to make its case, and forcing one in would cost real Lighthouse performance for no clarity gain. Three.js is genuinely worth reaching for in Phase 5, for an interactive India map in NHIC — that's where a 3D/geo visual actually earns its cost.

## Known gap, stated honestly

The nav links (`/marketplace`, `/verify`, `/for-weavers`, etc.) are not yet built — this phase is the homepage shell. `experimental.typedRoutes` in `next.config.js` means these currently need an `as never` cast until those routes exist; that cast gets removed naturally as each route is added in later phases.

## Next: Phase 4 — Dashboards (Buyer, Weaver, Government, Admin)
