/**
 * Auth-related Zod schemas.
 *
 * These run in TWO places:
 *  1. Client forms — for immediate UX feedback (see features/auth/hooks).
 *  2. Route Handlers — for the actual security-relevant check.
 *
 * Never trust #1 alone. #2 is what actually protects the system; #1 only
 * makes the UX pleasant. Importing the same schema in both places is what
 * guarantees they can't silently drift out of sync.
 */
import { z } from "zod";

// India-specific phone validation: +91 followed by a 10-digit number
// starting 6-9 (valid Indian mobile prefix range), with the country code
// optional on input but normalized before storage.
const indianPhoneRegex = /^(?:\+91)?[6-9]\d{9}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

// Deliberately stricter than a typical consumer app: this is a platform
// that verifies real economic identities, so weak-password tolerance is
// a real risk, not just a nicety.
export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one symbol");

export const roleSchema = z.enum(["weaver", "buyer", "government", "admin"], {
  errorMap: () => ({ message: "Select a valid role" }),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number"),
    password: passwordSchema,
    confirmPassword: z.string(),
    // Self-selected at registration; government/admin roles are NEVER
    // grantable via public self-registration — enforced server-side in
    // the Route Handler regardless of what the client sends (see
    // app/api/auth/set-role/route.ts). This schema only restricts the
    // *public* registration form's allowed values.
    role: z.enum(["weaver", "buyer"], {
      errorMap: () => ({ message: "Select weaver or buyer" }),
    }),
    // Required consent checkpoint — ties into the Responsible AI framework
    // (Rev 3 §5): a weaver must consent before any AI processing of their
    // product images/data happens later in the product flow. Captured at
    // registration so it's never silently assumed.
    consentToDataProcessing: z.literal(true, {
      errorMap: () => ({ message: "You must accept the data processing terms to continue" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Server-side session-establishment payload: the client sends the Firebase
// ID token it already holds after a successful client-side sign-in; the
// server verifies it and mints an httpOnly session cookie. The client
// never sets its own session cookie value.
export const sessionRequestSchema = z.object({
  idToken: z.string().min(1),
});
