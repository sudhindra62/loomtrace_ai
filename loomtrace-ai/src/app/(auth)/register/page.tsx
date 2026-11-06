"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error: authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "weaver" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setSubmitting(true);
    try {
      await registerUser(data);
      router.push("/verify-email");
    } catch {
      // authError from useAuth already reflects the failure; nothing
      // further to do here besides re-enabling the form below.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Create your LoomTrace account
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        For weavers registering products, or buyers exploring verified handlooms.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            type="text"
            autoComplete="name"
            className={inputClass(!!errors.fullName)}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={inputClass(!!errors.email)} />
        </Field>

        <Field label="Mobile number" error={errors.phone?.message}>
          <div className="flex items-center rounded-lg border border-neutral-300 focus-within:ring-2 focus-within:ring-neutral-900 dark:border-neutral-700">
            <span className="pl-3 text-sm text-neutral-500">+91</span>
            <input
              {...register("phone")}
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              className="w-full rounded-lg bg-transparent px-2 py-2.5 text-sm outline-none"
            />
          </div>
        </Field>

        <Field label="I am registering as" error={errors.role?.message}>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption value="weaver" label="Weaver" register={register} />
            <RoleOption value="buyer" label="Buyer" register={register} />
          </div>
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.password)}
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.confirmPassword)}
          />
        </Field>

        <label className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input
            {...register("consentToDataProcessing")}
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
          />
          <span>
            I consent to LoomTrace processing my product images and data, including AI-assisted analysis, as
            described in the{" "}
            <a href="/privacy" className="underline underline-offset-2">
              Privacy &amp; AI Use Policy
            </a>
            .
          </span>
        </label>
        {errors.consentToDataProcessing && (
          <p className="text-sm text-red-600">{errors.consentToDataProcessing.message}</p>
        )}

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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-neutral-900 underline underline-offset-2 dark:text-white">
          Sign in
        </a>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white ${
    hasError ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"
  }`;
}

function RoleOption({
  value,
  label,
  register,
}: {
  value: "weaver" | "buyer";
  label: string;
  register: ReturnType<typeof useForm<RegisterInput>>["register"];
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-neutral-300 px-3 py-2.5 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white dark:border-neutral-700 dark:has-[:checked]:bg-white dark:has-[:checked]:text-neutral-900">
      <input {...register("role")} type="radio" value={value} className="sr-only" />
      {label}
    </label>
  );
}
