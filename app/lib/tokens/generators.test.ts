import { describe, expect, it } from "vitest";
import type { TokenModel } from "./model";
import { generateTailwindTheme } from "./generate-tailwind-theme";
import { generateChakraTheme } from "./generate-chakra-theme";
import { generateShadcnVars } from "./generate-shadcn-vars";

const sampleModel: TokenModel = {
  colors: [{ name: "blue-500", value: "#3b82f6" }],
  spacing: [{ name: "sm", value: "8px" }],
  typography: [{ name: "body", fontSize: "16px" }],
  radius: [{ name: "md", value: "8px" }],
  shadow: [{ name: "sm", value: "0px 1px 2px rgba(0, 0, 0, 0.05)" }],
};

describe("generateTailwindTheme", () => {
  const output = generateTailwindTheme(sampleModel);

  it("produces a valid @theme block", () => {
    expect(output).toContain("@theme {");
    expect(output).toContain("--color-blue-500: #3b82f6;");
    expect(output).toContain("--spacing-sm: 8px;");
    expect(output).toContain("--radius-md: 8px;");
    expect(output).toContain("--shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);");
    expect(output.trim().endsWith("}")).toBe(true);
  });

  it("produces balanced braces (structurally valid CSS)", () => {
    const opens = (output.match(/\{/g) ?? []).length;
    const closes = (output.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
    expect(opens).toBe(1);
  });
});

describe("generateChakraTheme", () => {
  const output = generateChakraTheme(sampleModel);

  it("produces a parseable JS module exporting a theme object", () => {
    expect(output.startsWith("export const theme = ")).toBe(true);
    const jsonPart = output.replace("export const theme = ", "").replace(/;\s*$/, "");
    const parsed = JSON.parse(jsonPart);
    expect(parsed.colors.blue["500"]).toBe("#3b82f6");
    expect(parsed.space.sm).toBe("8px");
    expect(parsed.radii.md).toBe("8px");
    expect(parsed.shadows.sm).toBe("0px 1px 2px rgba(0, 0, 0, 0.05)");
  });
});

describe("generateShadcnVars", () => {
  const output = generateShadcnVars(sampleModel);

  it("produces a valid :root CSS variables block", () => {
    expect(output).toContain(":root {");
    expect(output).toContain("--blue-500: #3b82f6;");
    expect(output).toContain("--spacing-sm: 8px;");
    expect(output).toContain("--radius-md: 8px;");
    expect(output.trim().endsWith("}")).toBe(true);
  });

  it("produces balanced braces (structurally valid CSS)", () => {
    const opens = (output.match(/\{/g) ?? []).length;
    const closes = (output.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
  });
});
