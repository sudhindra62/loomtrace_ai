"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  registerWithEmail,
  loginWithEmail,
  sendForgotPasswordEmail,
  resendVerificationEmail,
  establishServerSession,
  signOut as signOutService,
  AuthServiceError,
} from "@/features/auth/services/auth.service";
import type { RegisterInput, LoginInput, ForgotPasswordInput } from "@/lib/validation/auth.schema";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Single hook for all auth-related client state and actions. Feature
 * components (login form, register form, navbar) consume this rather
 * than talking to Firebase or the auth service directly — keeps the
 * "how" of auth isolated to one place, per the reusable-hooks requirement.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({ ...prev, user, loading: false }));
    });
    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  const register = useCallback(async (input: RegisterInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await registerWithEmail(input);
      // No server session established here — email is unverified, and
      // /api/auth/session deliberately refuses to mint a cookie for an
      // unverified account (see route.ts). The UI routes to the
      // verify-email screen instead.
      setState((prev) => ({ ...prev, loading: false }));
      return { requiresVerification: true };
    } catch (err) {
      const message = err instanceof AuthServiceError ? err.message : "Registration failed.";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const credential = await loginWithEmail(input);
      if (!credential.user.emailVerified) {
        setState((prev) => ({ ...prev, loading: false }));
        return { requiresVerification: true, role: null };
      }
      const { role } = await establishServerSession();
      setState((prev) => ({ ...prev, loading: false }));
      return { requiresVerification: false, role };
    } catch (err) {
      const message = err instanceof AuthServiceError ? err.message : "Sign in failed.";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (input: ForgotPasswordInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await sendForgotPasswordEmail(input);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      const message = err instanceof AuthServiceError ? err.message : "Could not send reset email.";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await resendVerificationEmail();
    } catch (err) {
      const message = err instanceof AuthServiceError ? err.message : "Could not resend verification email.";
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
  }, []);

  return { ...state, register, login, forgotPassword, resendVerification, signOut, clearError };
}
