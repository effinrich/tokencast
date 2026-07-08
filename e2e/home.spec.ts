import { test, expect } from "@playwright/test";

test("home route renders and the action round-trip works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tokencast" })).toBeVisible();

  // Exercises the real RR8 loader + action round-trip, not just client render.
  await page.getByLabel("Framework-mode smoke test (loader + action)").fill("framework mode works");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("echo-result")).toHaveText("Action echoed: framework mode works");
});
