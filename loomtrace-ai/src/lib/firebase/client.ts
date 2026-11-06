/**
 * Firebase Client SDK — safe to import from Client Components.
 *
 * Rules for this file:
 *  - Only Auth (session state) and read-only, security-rule-governed
 *    Firestore listeners should be driven from the client SDK.
 *  - Any write that needs server-side validation (Zod re-check, Gemini
 *    calls, custom-claims checks) goes through a Route Handler using the
 *    Admin SDK instead — see lib/firebase/admin.ts.
 */
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigPresent() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    // Fails loudly and early in dev rather than producing a confusing
    // downstream Firebase SDK error with no context.
    throw new Error(
      `Missing Firebase client config: ${missing.join(", ")}. Check .env.local against .env.local.example.`
    );
  }
}

if (process.env.NODE_ENV !== "test") {
  assertConfigPresent();
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Connect to local emulators automatically when running against them —
// controlled by an explicit flag, never inferred from NODE_ENV alone,
// so a misconfigured production build can't silently talk to a local emulator.
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

let emulatorsConnected = false;
export function connectToEmulatorsOnce() {
  if (!useEmulators || emulatorsConnected) return;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  emulatorsConnected = true;
}

if (typeof window !== "undefined") {
  connectToEmulatorsOnce();
}
