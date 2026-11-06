import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Per Phase 1 Rev 3 §3: automated axe-core scans in CI, catching roughly
// a third of real accessibility issues — necessary but not sufficient,
// paired with a manual screen-reader pass documented in
// docs/ACCESSIBILITY_CHECKLIST.md before any production sign-off.
test.describe("Accessibility — WCAG 2.2 AA scan", () => {
  test("homepage has no critical violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test("login page has no critical violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test("register page has no critical violations", async ({ page }) => {
    await page.goto("/register");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
});

function formatViolations(violations: { id: string; help: string; nodes: unknown[] }[]): string {
  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`).join("\n");
}
