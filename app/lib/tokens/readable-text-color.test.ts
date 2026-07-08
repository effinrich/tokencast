import { describe, expect, it } from "vitest";
import { readableTextColor } from "./readable-text-color";

describe("readableTextColor", () => {
  it("picks whichever of black/white has the higher real contrast ratio, not a naive luminance guess", () => {
    // #3b82f6 (blue-500) "looks dark" but its true WCAG contrast against white
    // is only ~3.68:1 (fails AA's 4.5:1) vs ~5.71:1 against black.
    expect(readableTextColor("#3b82f6")).toBe("#000000");
    expect(readableTextColor("#f43f5e")).toBe("#000000");
  });

  it("returns black text for a near-white background", () => {
    expect(readableTextColor("#fafafa")).toBe("#000000");
  });

  it("returns the correct color for true black and true white", () => {
    expect(readableTextColor("#000000")).toBe("#ffffff");
    expect(readableTextColor("#ffffff")).toBe("#000000");
  });

  it("handles 3-digit hex", () => {
    expect(readableTextColor("#fff")).toBe("#000000");
    expect(readableTextColor("#000")).toBe("#ffffff");
  });

  it("falls back to white for unparseable input", () => {
    expect(readableTextColor("var(--some-color)")).toBe("#ffffff");
  });
});
