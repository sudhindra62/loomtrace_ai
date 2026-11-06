"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ROLE_HOME: Record<string, string> = {
  weaver: "/weaver",
  buyer: "/buyer",
  government: "/government",
  admin: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error: authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      const result = await login(data);
      if (result.requiresVerification) {
        router.push("/verify-email");
        return;
      }
      const redirectTo = searchParams.get("redirectTo");
      router.push(redirectTo ?? (result.role ? ROLE_HOME[result.role] ?? "/" : "/"));
    } catch {
      // authError already reflects the failure.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Welcome back to LoomTrace.</p>

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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
            <a href="/forgot-password" className="text-sm text-neutral-500 underline underline-offset-2">
              Forgot password?
            </a>
          </div>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {authError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40">
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New to LoomTrace?{" "}
        <a href="/register" className="font-medium text-neutral-900 underline underline-offset-2 dark:text-white">
          Create an account
        </a>
      </p>
    </div>
  );
}
