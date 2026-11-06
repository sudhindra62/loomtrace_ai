/**
 * Firebase Admin SDK — SERVER-ONLY.
 *
 * Never import this file from a Client Component or anything that ends up
 * in a browser bundle. It holds a service-account credential capable of
 * bypassing all Firestore/Storage security rules.
 *
 * Import guard below throws immediately if this somehow gets pulled into
 * a client bundle, rather than failing silently or leaking the key.
 */
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local " +
        "(server-only — do not prefix with NEXT_PUBLIC_)."
    );
  }

  // Env vars store \n as a literal two-character sequence; the SDK needs a
  // real newline character in the PEM key.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = getAdminApp();

export const adminAuth = getAdminAuth(adminApp);
export const adminDb = getAdminFirestore(adminApp);
export const adminStorage = getAdminStorage(adminApp);

/**
 * Custom claims are the RBAC source of truth (see ADR in Rev 2 §8 —
 * Firestore-field-based roles are client-spoofable, custom claims are not).
 * This is the ONLY place role claims should ever be set.
 */
export type UserRole = "weaver" | "buyer" | "government" | "admin";

export async function setUserRoleClaim(uid: string, role: UserRole): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { role });
}
