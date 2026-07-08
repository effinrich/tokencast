import { test, expect, type Page } from "@playwright/test";

async function tabUntilFocused(page: Page, locator: ReturnType<Page["getByLabel"]>, maxTabs = 20) {
  for (let i = 0; i < maxTabs; i++) {
    if (await locator.evaluate((el) => el === document.activeElement).catch(() => false)) return;
    await page.keyboard.press("Tab");
  }
  await expect(locator).toBeFocused();
}

test("full keyboard-only pass: paste -> preview -> export -> save -> share, no mouse", async ({
  page,
}) => {
  await page.goto("/");

  // Reach and use the textarea via keyboard alone.
  const textarea = page.getByLabel("Paste your design tokens");
  await tabUntilFocused(page, textarea);
  await expect(textarea).toBeFocused();
  await textarea.selectText();
  await page.keyboard.press("Delete");
  await page.keyboard.type(
    JSON.stringify({
      global: { color: { kb: { value: "#123456", type: "color" } } },
    }),
  );
  await expect(page.getByTestId("live-preview")).toContainText("global-color-kb");

  // Tab into the export-format tab group and switch tabs via Enter alone.
  const chakraTab = page.getByRole("button", { name: "Chakra" });
  await tabUntilFocused(page, chakraTab);
  await expect(chakraTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("export-output")).toContainText("export const theme");

  // Tab to "Save & share" and activate it with the keyboard alone.
  const saveButton = page.getByRole("button", { name: "Save & share" });
  await tabUntilFocused(page, saveButton);
  await expect(saveButton).toBeFocused();
  await page.keyboard.press("Enter");

  const shareLink = page.getByTestId("share-url").getByRole("link");
  await expect(shareLink).toBeVisible({ timeout: 10_000 });

  // Tab to the resulting share link and follow it with Enter alone.
  await tabUntilFocused(page, shareLink);
  await expect(shareLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByText(/Viewing a shared conversion/)).toBeVisible();
});
