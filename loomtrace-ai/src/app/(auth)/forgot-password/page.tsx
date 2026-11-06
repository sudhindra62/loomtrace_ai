"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    try {
      await forgotPassword(data);
    } finally {
      // Always show the same confirmation regardless of whether the email
      // exists — see the account-enumeration note in auth.service.ts.
      setSent(true);
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-neutral-500">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
        <a href="/login" className="mt-6 inline-block text-sm font-medium underline underline-offset-2">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Enter the email associated with your account and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
