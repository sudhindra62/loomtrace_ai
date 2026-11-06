"use client";

/**
 * Thin wrapper around Firebase client Auth calls. Kept deliberately free
 * of React (no hooks here) so it's independently testable and reusable
 * from anywhere, including non-component code.
 *
 * IMPORTANT: none of these functions alone establish an authenticated
 * *session* the server trusts. After any successful sign-in/register,
 * callers must call establishServerSession() to exchange the resulting
 * ID token for the httpOnly cookie the server actually checks.
 */
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import type { RegisterInput, LoginInput, ForgotPasswordInput } from "@/lib/validation/auth.schema";

export class AuthServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function toAuthServiceError(err: unknown): AuthServiceError {
  const code = (err as { code?: string })?.code ?? "unknown";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/user-disabled": "This account has been suspended. Contact support.",
  };
  return new AuthServiceError(code, messages[code] ?? "Something went wrong. Please try again.");
}

export async function registerWithEmail(input: RegisterInput): Promise<UserCredential> {
  try {
    const normalizedPhone = input.phone.startsWith("+91") ? input.phone : `+91${input.phone}`;

    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(credential.user, { displayName: input.fullName });

    // users/{uid} is created client-side with baseline profile data.
    // Note: 'role' here is a display/query convenience field ONLY — the
    // security-relevant role claim is set server-side in a Cloud Function
    // trigger on user creation (see functions/src/triggers/onUserCreate.ts),
    // never trusted from this client write. Firestore rules for this
    // collection restrict which fields a client can write for this exact
    // reason (see firestore.rules).
    await setDoc(doc(db, "users", credential.user.uid), {
      fullName: input.fullName,
      email: input.email,
      phone: normalizedPhone,
      requestedRole: input.role,
      emailVerified: false,
      status: "active",
      consentToDataProcessing: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await sendEmailVerification(credential.user);
    return credential;
  } catch (err) {
    throw toAuthServiceError(err);
  }
}

export async function loginWithEmail(input: LoginInput): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, input.email, input.password);
  } catch (err) {
    throw toAuthServiceError(err);
  }
}

export async function sendForgotPasswordEmail(input: ForgotPasswordInput): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, input.email);
  } catch (err) {
    // Deliberately does NOT distinguish "email not found" from other
    // errors in the message shown to the user — enumerating valid emails
    // via a forgot-password form is a real, common account-enumeration
    // vulnerability, and this platform handles identity data for real
    // livelihoods, so this is treated as a security decision, not an
    // oversight.
    if ((err as { code?: string })?.code === "auth/user-not-found") {
      return; // resolve silently; UI shows the same "check your email" message either way
    }
    throw toAuthServiceError(err);
  }
}

export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new AuthServiceError("no-user", "No signed-in user to verify.");
  await sendEmailVerification(auth.currentUser);
}

/** Exchanges the current Firebase ID token for the server's httpOnly session cookie. */
export async function establishServerSession(): Promise<{ role: string | null }> {
  if (!auth.currentUser) throw new AuthServiceError("no-user", "No signed-in user.");
  const idToken = await auth.currentUser.getIdToken(/* forceRefresh */ true);

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new AuthServiceError(
      body?.error?.code ?? "session_failed",
      body?.error?.message ?? "Could not establish session."
    );
  }

  return res.json();
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
  await firebaseSignOut(auth);
}
