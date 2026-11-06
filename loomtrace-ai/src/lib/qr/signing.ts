import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed verification tokens, per Phase 1 Rev 2 §8 — prevents enumerating
 * unpublished DPI IDs to scrape products before their owner publishes
 * them. The token is appended to the public verification URL; the scan
 * route (or verification page) re-derives and compares it before serving
 * the passport.
 */
function getSecret(): string {
  const secret = process.env.SESSION_COOKIE_SECRET; // reused signing secret, server-only either way
  if (!secret) throw new Error("SESSION_COOKIE_SECRET is not configured.");
  return secret;
}

export function signDpiToken(dpiId: string): string {
  return createHmac("sha256", getSecret()).update(dpiId).digest("hex").slice(0, 24);
}

export function verifyDpiToken(dpiId: string, token: string): boolean {
  const expected = signDpiToken(dpiId);
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(token || "");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

export function buildVerificationUrl(dpiId: string, baseUrl: string): string {
  return `${baseUrl}/verify/${dpiId}?t=${signDpiToken(dpiId)}`;
}
