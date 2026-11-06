import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, type UserRole } from "@/lib/firebase/admin";

export interface VerifiedSession {
  uid: string;
  email: string | null;
  role: UserRole | null;
}

/**
 * Verifies the httpOnly session cookie against Firebase Auth.
 * Returns null (never throws) when there's no valid session — callers
 * decide what to do with an unauthenticated request, this helper's job
 * is only to answer "who, if anyone, is this."
 */
export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, /* checkRevoked */ true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: (decoded.role as UserRole | undefined) ?? null,
    };
  } catch {
    // Expired, revoked, or tampered cookie — treated as "no session",
    // never surfaced as a 500. Middleware/Route Handlers redirect or
    // 401 as appropriate.
    return null;
  }
}

export async function requireRole(allowed: UserRole[]): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (!session || !session.role || !allowed.includes(session.role)) {
    throw new Response(
      JSON.stringify({ error: { code: "forbidden", message: "You do not have access to this resource." } }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    ) as never; // thrown Response caught by route/middleware error handling
  }
  return session;
}

/**
 * Server Component / layout variant of the role guard above. Route
 * Handlers throw a Response (caught by Next's routing machinery);
 * layouts instead need a real Next.js redirect(), which itself works by
 * throwing a special internal signal — the two are NOT interchangeable,
 * which is why this is a separate function rather than one guard reused
 * everywhere.
 */
export async function requireRoleOrRedirect(allowed: UserRole[]): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.role || !allowed.includes(session.role)) {
    redirect("/"); // authenticated but wrong role — home, not a login loop
  }
  return session;
}
