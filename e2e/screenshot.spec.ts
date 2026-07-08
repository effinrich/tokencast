import { test } from "@playwright/test";

test.skip(!!process.env.CI, "manual evidence-capture test, not part of CI gating");

test("capture desktop and mobile screenshots for phase evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.screenshot({ path: "/tmp/tokencast-desktop.png", fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "/tmp/tokencast-mobile.png", fullPage: false });

  // Malformed-input state, for evidence
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel("Paste your design tokens").fill("{ this is not valid json");
  await page.screenshot({ path: "/tmp/tokencast-error-state.png", fullPage: false });
});
