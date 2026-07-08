import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFigmaTokens } from "./parse-figma-tokens";
import { generateTailwindTheme } from "./generate-tailwind-theme";

const fixture = (name: string) => readFileSync(resolve(__dirname, "../../../fixtures", name), "utf-8");

describe("round-trip: Figma tokens -> internal model -> Tailwind theme", () => {
  const model = parseFigmaTokens(fixture("figma-tokens.json"));
  const output = generateTailwindTheme(model);

  it("preserves every color value exactly, no precision loss", () => {
    expect(output).toContain("--color-global-color-blue-500: #3b82f6;");
    expect(output).toContain("--color-global-color-blue-600: #2563eb;");
    expect(output).toContain("--color-global-color-zinc-50: #fafafa;");
    expect(output).toContain("--color-global-color-zinc-950: #09090b;");
  });

  it("preserves every spacing value exactly, including the unit", () => {
    expect(output).toContain("--spacing-global-spacing-xs: 4px;");
    expect(output).toContain("--spacing-global-spacing-sm: 8px;");
    expect(output).toContain("--spacing-global-spacing-md: 16px;");
    expect(output).toContain("--spacing-global-spacing-lg: 24px;");
  });

  it("preserves radius and shadow values exactly", () => {
    expect(output).toContain("--radius-global-radius-sm: 4px;");
    expect(output).toContain("--radius-global-radius-md: 8px;");
    expect(output).toContain("--shadow-global-shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);");
  });

  it("carries the exact source count through with no entries dropped or duplicated", () => {
    const sourceColorCount = 4; // blue.500, blue.600, zinc.50, zinc.950
    const outputColorLines = output.split("\n").filter((l) => l.trim().startsWith("--color-"));
    expect(outputColorLines).toHaveLength(sourceColorCount);
  });
});
