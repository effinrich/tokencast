import { test, expect } from "@playwright/test";

test("home route renders the Tokencast workbench with a live default preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tokencast" })).toBeVisible();
  await expect(page.getByTestId("live-preview")).toBeVisible();
  await expect(page.getByTestId("status-bar")).toHaveText("Parsed successfully");
});

test("pasting a real Figma token export updates the live preview with no reload", async ({ page }) => {
  await page.goto("/");
  const textarea = page.getByLabel("Paste your design tokens");
  await textarea.fill(
    JSON.stringify({
      global: {
        color: { special: { value: "#ff00aa", type: "color" } },
        spacing: { big: { value: "40px", type: "spacing" } },
      },
    }),
  );
  await expect(page.getByTestId("live-preview")).toContainText("global-color-special");
  await expect(page.getByRole("button", { name: "Primary button" })).toHaveCSS(
    "background-color",
    "rgb(255, 0, 170)",
  );
});

test("all three export formats produce output for the same input", async ({ page }) => {
  await page.goto("/");
  const output = page.getByTestId("export-output");

  await expect(output).toContainText("@theme {");

  await page.getByRole("button", { name: "Chakra" }).click();
  await expect(output).toContainText("export const theme");

  await page.getByRole("button", { name: "shadcn/ui" }).click();
  await expect(output).toContainText(":root {");
});

test("malformed input shows a clear inline error, not a crash", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Paste your design tokens").fill("{ this is not valid json");

  await expect(page.getByTestId("parse-error")).toBeVisible();
  await expect(page.getByTestId("parse-error")).toContainText("doesn't look like valid JSON");
  await expect(page.getByTestId("status-bar")).toHaveText("Parse error");
  await expect(page.getByText("Fix the input error to see a live preview.")).toBeVisible();
});

test("copy configuration button copies the export output to the clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy configuration" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain("@theme {");
});
