import { test, expect } from "@playwright/test";

test("save & share persists a real conversion and a fresh visit re-renders it", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Save & share" }).click();

  const shareLink = page.getByTestId("share-url").getByRole("link");
  await expect(shareLink).toBeVisible({ timeout: 10_000 });
  const shareHref = await shareLink.getAttribute("href");
  expect(shareHref).toMatch(/\/t\/[a-f0-9]{10}$/);

  // Fresh browser context — no cookies, no client state — proves this is a
  // real server-side load from Supabase, not localStorage/session replay.
  const freshPage = await context.browser()!.newContext().then((c) => c.newPage());
  await freshPage.goto(shareHref!);

  await expect(freshPage.getByText(/Viewing a shared conversion/)).toBeVisible();
  await expect(freshPage.getByTestId("live-preview")).toBeVisible();
  await expect(freshPage.getByLabel("Paste your design tokens")).toHaveAttribute("readonly", "");
  await freshPage.close();
});

test("visiting an unknown share slug shows a real not-found state", async ({ page }) => {
  await page.goto("/t/this-slug-does-not-exist");
  await expect(page.getByText(/No share found/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Tokencast" })).toBeVisible();
});
