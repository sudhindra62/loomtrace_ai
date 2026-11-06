import { describe, it, expect } from "vitest";
import { registerSchema, passwordSchema, loginSchema } from "@/lib/validation/auth.schema";

describe("passwordSchema", () => {
  it("rejects passwords under 10 characters", () => {
    expect(passwordSchema.safeParse("Ab1!").success).toBe(false);
  });

  it("rejects passwords missing a symbol", () => {
    expect(passwordSchema.safeParse("Abcdefgh12").success).toBe(false);
  });

  it("accepts a password meeting all requirements", () => {
    expect(passwordSchema.safeParse("Abcdefgh12!").success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validBase = {
    fullName: "Kamala Devi",
    email: "kamala@example.com",
    phone: "9876543210",
    password: "Abcdefgh12!",
    confirmPassword: "Abcdefgh12!",
    role: "weaver" as const,
    consentToDataProcessing: true as const,
  };

  it("accepts a fully valid registration", () => {
    expect(registerSchema.safeParse(validBase).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validBase, confirmPassword: "Different123!" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid Indian phone number", () => {
    const result = registerSchema.safeParse({ ...validBase, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects government/admin as a self-selected role", () => {
    // @ts-expect-error deliberately testing an invalid role value
    const result = registerSchema.safeParse({ ...validBase, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects registration without consent", () => {
    const result = registerSchema.safeParse({ ...validBase, consentToDataProcessing: false });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("normalizes email casing via the shared emailSchema", () => {
    const result = loginSchema.safeParse({ email: "KAMALA@Example.com", password: "x" });
    expect(result.success && result.data.email).toBe("kamala@example.com");
  });
});
