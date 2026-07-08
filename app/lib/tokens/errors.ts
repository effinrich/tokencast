export type TokenParseErrorCode = "invalid-json" | "unsupported-token-type" | "empty-input";

export class TokenParseError extends Error {
  readonly code: TokenParseErrorCode;

  constructor(code: TokenParseErrorCode, message: string) {
    super(message);
    this.name = "TokenParseError";
    this.code = code;
  }
}
