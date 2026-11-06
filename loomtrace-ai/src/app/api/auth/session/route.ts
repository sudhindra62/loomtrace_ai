/**
 * POST /api/auth/session
 *
 * Exchanges a short-lived Firebase ID token (obtained client-side after
 * sign-in/register) for a long-lived, httpOnly, secure session cookie.
 *
 * Why this exists instead of just using the ID token directly:
 *  - ID tokens are designed to be short-lived (1hr) and are readable by
 *    client JS, which makes them a poor session mechanism on their own.
 *  - Firebase's session-cookie API lets the server verify the token was
 *    genuinely issued by Firebase Auth, then mint a cookie the browser
 *    can't read or tamper with (httpOnly), checked on every request by
 *    src/middleware.ts.
 *
 * DELETE /api/auth/session logs the user out by clearing the cookie.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { sessionRequestSchema } from "@/lib/validation/auth.schema";

const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_body", message: "Malformed JSON" } }, { status: 400 });
  }

  const parsed = sessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation_error", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  try {
    // Verifying the ID token here (not just trusting the client) is what
    // actually establishes this request came from a real, current
    // Firebase Auth sign-in — this call talks to Firebase, it isn't a
    // local JWT decode.
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken, /* checkRevoked */ true);

    if (!decoded.email_verified) {
      // Session cookies are still withheld pre-verification. The account
      // exists (so a "verify your email" screen can be shown), but no
      // authenticated session is granted — this is what actually enforces
      // the "Email Verification" requirement rather than just having a
      // verify-email page that nothing checks.
      return NextResponse.json(
        { error: { code: "email_not_verified", message: "Please verify your email before signing in." } },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "ok", role: decoded.role ?? null });
  } catch (err) {
    // Deliberately generic external error message — internal details
    // (which Firebase error, stack trace) go to Cloud Logging only, never
    // to the client response. Avoids leaking auth-system internals to a
    // potential attacker probing this endpoint.
    console.error("[auth/session] verification failed", err);
    return NextResponse.json(
      { error: { code: "session_creation_failed", message: "Could not establish session." } },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: "ok" });
}
