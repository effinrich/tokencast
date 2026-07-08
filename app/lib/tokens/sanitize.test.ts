import { describe, expect, it } from "vitest";
import { sanitizeTokenText, sanitizeTokenModel } from "./sanitize";
import { emptyTokenModel } from "./model";

describe("sanitizeTokenText", () => {
  it("strips angle brackets, quotes, and backticks", () => {
    expect(sanitizeTokenText('<script>alert(1)</script>')).toBe("scriptalert(1)/script");
    expect(sanitizeTokenText(`it's "quoted" \`backticked\``)).toBe("its quoted backticked");
  });

  it("leaves legitimate CSS-shaped values untouched", () => {
    expect(sanitizeTokenText("rgba(0, 0, 0, 0.05)")).toBe("rgba(0, 0, 0, 0.05)");
    expect(sanitizeTokenText("#3b82f6")).toBe("#3b82f6");
    expect(sanitizeTokenText("1.5rem")).toBe("1.5rem");
  });

  it("caps length to 200 characters", () => {
    const long = "a".repeat(500);
    expect(sanitizeTokenText(long)).toHaveLength(200);
  });
});

describe("sanitizeTokenModel", () => {
  it("neutralizes an XSS-shaped token name across every category", () => {
    const xss = "<script>alert(1)</script>";
    const model = {
      ...emptyTokenModel(),
      colors: [{ name: xss, value: xss }],
      spacing: [{ name: xss, value: "8px" }],
      radius: [{ name: xss, value: "8px" }],
      shadow: [{ name: xss, value: "8px" }],
      typography: [{ name: xss, fontFamily: xss, fontSize: xss, fontWeight: xss, lineHeight: xss }],
    };

    const sanitized = sanitizeTokenModel(model);

    for (const category of [
      sanitized.colors,
      sanitized.spacing,
      sanitized.radius,
      sanitized.shadow,
    ]) {
      for (const entry of category) {
        expect(entry.name).not.toContain("<script>");
        expect(entry.value).not.toContain("<script>");
      }
    }
    expect(sanitized.typography[0].name).not.toContain("<");
    expect(sanitized.typography[0].fontFamily).not.toContain("<");
  });
});
