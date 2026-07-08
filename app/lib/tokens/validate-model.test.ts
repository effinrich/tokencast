import { describe, expect, it } from "vitest";
import { parseAndValidateShareRequest, ShareValidationError } from "./validate-model";
import { emptyTokenModel } from "./model";

const validModel = JSON.stringify({
  ...emptyTokenModel(),
  colors: [{ name: "brand", value: "#3b82f6" }],
});

describe("parseAndValidateShareRequest", () => {
  it("accepts a well-formed token model", () => {
    const model = parseAndValidateShareRequest(validModel);
    expect(model.colors).toEqual([{ name: "brand", value: "#3b82f6" }]);
  });

  it("rejects a payload over the byte limit before even parsing JSON", () => {
    const huge = JSON.stringify({
      ...emptyTokenModel(),
      colors: Array.from({ length: 2000 }, (_, i) => ({ name: `token-${i}`, value: "#ffffff" })),
    });
    try {
      parseAndValidateShareRequest(huge);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ShareValidationError);
      expect((err as ShareValidationError).code).toBe("payload_too_large");
    }
  });

  it("rejects malformed JSON", () => {
    try {
      parseAndValidateShareRequest("{ not json");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ShareValidationError);
      expect((err as ShareValidationError).code).toBe("invalid_json");
    }
  });

  it("rejects JSON that doesn't match the TokenModel shape", () => {
    try {
      parseAndValidateShareRequest(JSON.stringify({ colors: "not an array" }));
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ShareValidationError);
      expect((err as ShareValidationError).code).toBe("invalid_shape");
    }
  });

  it("rejects a model with a malformed color entry (missing value)", () => {
    const bad = JSON.stringify({
      ...emptyTokenModel(),
      colors: [{ name: "brand" }],
    });
    try {
      parseAndValidateShareRequest(bad);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ShareValidationError);
      expect((err as ShareValidationError).code).toBe("invalid_shape");
    }
  });
});
