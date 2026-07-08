import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFigmaTokens } from "./parse-figma-tokens";
import { parseCssVars } from "./parse-css-vars";
import { parseTailwindConfig } from "./parse-tailwind-config";
import { TokenParseError } from "./errors";

const fixture = (name: string) => readFileSync(resolve(__dirname, "../../../fixtures", name), "utf-8");

describe("parseFigmaTokens", () => {
  const model = parseFigmaTokens(fixture("figma-tokens.json"));

  it("normalizes colors", () => {
    expect(model.colors).toContainEqual({ name: "global-color-blue-500", value: "#3b82f6" });
    expect(model.colors).toHaveLength(4);
  });

  it("normalizes spacing", () => {
    expect(model.spacing).toContainEqual({ name: "global-spacing-md", value: "16px" });
  });

  it("normalizes typography with all sub-fields", () => {
    const heading = model.typography.find((t) => t.name === "global-typography-heading");
    expect(heading).toEqual({
      name: "global-typography-heading",
      fontFamily: "Inter",
      fontSize: "32px",
      fontWeight: "600",
      lineHeight: "40px",
    });
  });

  it("normalizes radius and shadow", () => {
    expect(model.radius).toContainEqual({ name: "global-radius-md", value: "8px" });
    expect(model.shadow).toContainEqual({
      name: "global-shadow-sm",
      value: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    });
  });

  it("rejects empty input", () => {
    expect(() => parseFigmaTokens("")).toThrow(TokenParseError);
  });

  it("rejects broken JSON with a typed error", () => {
    try {
      parseFigmaTokens("{ not valid json");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TokenParseError);
      expect((err as TokenParseError).code).toBe("invalid-json");
    }
  });

  it("rejects an unsupported token type with a typed error", () => {
    const bad = JSON.stringify({ global: { weird: { thing: { value: "x", type: "gradient" } } } });
    try {
      parseFigmaTokens(bad);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TokenParseError);
      expect((err as TokenParseError).code).toBe("unsupported-token-type");
      expect((err as Error).message).toContain("gradient");
    }
  });
});

describe("parseCssVars", () => {
  const model = parseCssVars(fixture("css-vars.css"));

  it("normalizes colors", () => {
    expect(model.colors).toContainEqual({ name: "blue-500", value: "#3b82f6" });
  });

  it("normalizes spacing, radius, shadow", () => {
    expect(model.spacing).toContainEqual({ name: "sm", value: "8px" });
    expect(model.radius).toContainEqual({ name: "md", value: "8px" });
    expect(model.shadow).toContainEqual({ name: "sm", value: "0px 1px 2px rgba(0, 0, 0, 0.05)" });
  });

  it("rejects input with no :root block", () => {
    expect(() => parseCssVars(".foo { color: red; }")).toThrow(TokenParseError);
  });

  it("rejects an unrecognized custom property prefix", () => {
    try {
      parseCssVars(":root { --totally-unknown-thing: 4px; }");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TokenParseError);
      expect((err as TokenParseError).code).toBe("unsupported-token-type");
    }
  });
});

describe("parseTailwindConfig", () => {
  const model = parseTailwindConfig(fixture("tailwind-config.json"));

  it("normalizes nested color shades", () => {
    expect(model.colors).toContainEqual({ name: "blue-500", value: "#3b82f6" });
    expect(model.colors).toContainEqual({ name: "zinc-950", value: "#09090b" });
  });

  it("normalizes spacing, radius, shadow", () => {
    expect(model.spacing).toContainEqual({ name: "lg", value: "24px" });
    expect(model.radius).toContainEqual({ name: "sm", value: "4px" });
    expect(model.shadow).toContainEqual({ name: "sm", value: "0px 1px 2px rgba(0, 0, 0, 0.05)" });
  });

  it("rejects malformed JSON", () => {
    expect(() => parseTailwindConfig("not json at all")).toThrow(TokenParseError);
  });

  it("rejects a config missing theme.extend", () => {
    try {
      parseTailwindConfig(JSON.stringify({ plugins: [] }));
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TokenParseError);
    }
  });

  it("rejects an unsupported extend key with a typed error", () => {
    try {
      parseTailwindConfig(JSON.stringify({ theme: { extend: { fontFamily: { sans: ["Inter"] } } } }));
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TokenParseError);
      expect((err as TokenParseError).code).toBe("unsupported-token-type");
      expect((err as Error).message).toContain("fontFamily");
    }
  });
});
