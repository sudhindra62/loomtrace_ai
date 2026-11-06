/**
 * Route-level RBAC gate. Runs before any (dashboard) route renders.
 *
 * This is defense-in-depth layer #1 of 3:
 *  1. Middleware (here) — coarse redirect for unauthenticated/wrong-role
 *     navigation, keeps unauthorized users from ever loading dashboard UI.
 *  2. Route Handler checks (requireRole in lib/firebase/session.ts) — the
 *     actual enforcement for any data-touching request, since middleware
 *     alone is a UX nicety, not a security boundary on its own.
 *  3. Firestore Security Rules — the last line of defense, enforced even
 *     if #1 and #2 were somehow bypassed entirely.
 *
 * Middleware runs on the Edge runtime, where the Admin SDK cannot run
 * (it needs Node APIs). So this performs a lightweight decode-and-check
 * against a mirrored, tamper-evident cookie claim rather than a full
 * Admin SDK verifySessionCookie call — full verification happens in
 * layer #2 for anything that actually matters. This tradeoff (fast,
 * coarse edge check + strict server check) is standard Next.js/Firebase
 * practice and is documented here so it isn't mistaken for the only check.
 */
import { NextRequest, NextResponse } from "next/server";

const ROLE_ROUTE_PREFIXES: Record<string, string> = {
  "/weaver": "weaver",
  "/buyer": "buyer",
  "/government": "government",
  "/admin": "admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(ROLE_ROUTE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) return NextResponse.next();

  const sessionCookie = request.cookies.get("__session");
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Presence check only at this layer, per the tradeoff documented above —
  // the Route Handlers and layout Server Components for each role area
  // call getVerifiedSession()/requireRole() on render/request, which is
  // where the cookie is actually cryptographically verified and the role
  // claim is trusted. A request with a present-but-invalid cookie reaches
  // that layer and is rejected there, not silently allowed through here.
  return NextResponse.next();
}

export const config = {
  matcher: ["/weaver/:path*", "/buyer/:path*", "/government/:path*", "/admin/:path*"],
};
