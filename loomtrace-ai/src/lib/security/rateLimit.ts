import "server-only";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Lightweight Firestore-backed rate limiter, per Phase 1 Rev 3 §2. Not a
 * distributed-systems-grade limiter (no sub-second precision, small race
 * window under heavy concurrent load) — deliberately simple, sufficient
 * to stop the realistic abuse case (a script hammering a Gemini-calling
 * route) without adding Redis/Upstash as a new infrastructure dependency
 * for a hackathon-to-production platform. Revisit if traffic ever
 * justifies it.
 */
const WINDOW_MS = 60_000;

export async function checkRateLimit(key: string, maxRequests: number): Promise<{ allowed: boolean; remaining: number }> {
  const ref = adminDb.collection("_rateLimits").doc(key);
  const now = Date.now();

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? (snap.data() as { windowStart: number; count: number }) : null;

    if (!data || now - data.windowStart > WINDOW_MS) {
      tx.set(ref, { windowStart: now, count: 1 });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (data.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    tx.update(ref, { count: data.count + 1 });
    return { allowed: true, remaining: maxRequests - data.count - 1 };
  });
}

/** Convenience wrapper for Route Handlers: keyed by uid for authenticated routes. */
export async function enforceRateLimit(uid: string, routeName: string, maxRequests = 10) {
  const { allowed } = await checkRateLimit(`${routeName}:${uid}`, maxRequests);
  return allowed;
}

/** Keyed by IP for anonymous/public routes (e.g. QR scan). */
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
