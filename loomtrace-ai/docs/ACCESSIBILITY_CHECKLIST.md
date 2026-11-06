# Accessibility Checklist — Manual Verification

Automated `axe-core` scans (`e2e/accessibility.spec.ts`) run in CI on every PR and catch roughly a third of real-world accessibility issues. This checklist covers what automated tooling structurally cannot — required before any production sign-off, per Phase 1 Rev 3 §3.

## Screen reader pass (NVDA on Windows + VoiceOver on macOS/iOS)
- [ ] Registration and login flows completable start-to-finish, errors announced
- [ ] Dashboard sidebar navigation announces current page (`aria-current`)
- [ ] Notification bell announces unread count on open
- [ ] Charts: "view as table" toggle reachable and announced correctly (`AccessibleChart` component)
- [ ] DPI verification page lifecycle timeline reads in logical order
- [ ] Product image upload: file selection and removal both usable without a mouse

## Keyboard-only pass
- [ ] Every interactive element reachable via Tab, in logical order
- [ ] No keyboard trap in the mobile nav drawer or notification dropdown
- [ ] Skip-to-content link is the first focusable element on every page
- [ ] Focus is visibly indicated at all times (never suppressed — verify no `outline: none` without a replacement)

## Visual
- [ ] 200% browser zoom: no horizontal scroll, no clipped/overlapping content
- [ ] High-contrast / dark mode: all text meets 4.5:1 contrast minimum
- [ ] `prefers-reduced-motion`: verify Hero's floating mockup and page transitions are actually suppressed, not just slowed

## Regional language content
- [ ] Devanagari, Tamil, Telugu, Bengali text renders correctly (no tofu boxes) in product descriptions and heritage stories
- [ ] Right-to-left concerns: N/A for currently supported languages, revisit if Urdu support is added

## Sign-off
Record scan results and manual pass date/tester here before each production release — this table is the actual audit trail, not just a task list.

| Date | Release | Automated scan | Manual pass | Signed off by |
|---|---|---|---|---|
| — | — | — | — | — |
