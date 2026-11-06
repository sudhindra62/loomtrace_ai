"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { resendVerification } = useAuth();
  const [status, setStatus] = useState<"checking" | "unverified" | "verified" | "no-user">("checking");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus(user ? (user.emailVerified ? "verified" : "unverified") : "no-user");
    });
    return unsubscribe;
  }, []);

  // Poll for verification every 4s, since Firebase doesn't push a
  // real-time event when the user clicks the email link in a separate tab.
  useEffect(() => {
    if (status !== "unverified") return;
    const interval = setInterval(async () => {
      if (!auth.currentUser) return;
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        setStatus("verified");
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "verified") {
      const timeout = setTimeout(() => router.push("/login"), 1500);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const handleResend = async () => {
    setResendState("sending");
    try {
      await resendVerification();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  if (status === "no-user") {
    return (
      <div className="animate-fade-up text-center">
        <p className="text-sm text-neutral-500">
          No account signed in.{" "}
          <a href="/login" className="font-medium underline underline-offset-2">
            Sign in
          </a>
        </p>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="animate-fade-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Email verified</h1>
        <p className="mt-2 text-sm text-neutral-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up flex flex-col items-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <svg className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold">Verify your email</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        We&apos;ve sent a verification link to your email address. Click it to activate your account — this page
        will update automatically.
      </p>

      <button
        onClick={handleResend}
        disabled={resendState === "sending"}
        className="mt-6 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Email sent" : "Resend email"}
      </button>
      {resendState === "error" && <p className="mt-2 text-sm text-red-600">Could not resend. Try again shortly.</p>}
    </div>
  );
}
