import { test, expect } from "@playwright/test";

test.describe("Registration flow", () => {
  test("shows validation errors for a weak password before submission", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test Weaver");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByPlaceholder("98765 43210").fill("9876543210");
    await page.getByLabel("Password", { exact: true }).fill("weak");
    await page.getByLabel("Confirm password").fill("weak");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();
  });

  test("blocks submission without consent checkbox", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test Weaver");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByPlaceholder("98765 43210").fill("9876543210");
    await page.getByLabel("Password", { exact: true }).fill("StrongPass123!");
    await page.getByLabel("Confirm password").fill("StrongPass123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/you must accept the data processing terms/i)).toBeVisible();
  });
});

test.describe("Dashboard route protection", () => {
  test("redirects an unauthenticated visitor away from the weaver dashboard", async ({ page }) => {
    await page.goto("/weaver");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects an unauthenticated visitor away from the government dashboard", async ({ page }) => {
    await page.goto("/government");
    await expect(page).toHaveURL(/\/login/);
  });
});
