import { describe, expect, it } from "vitest";
import { action, loader } from "./home";

describe("home route loader/action", () => {
  it("loader returns the greeting", async () => {
    const result = await loader({} as never);
    expect(result.greeting).toBe("Tokencast is warming up.");
  });

  it("action echoes back a submitted form field", async () => {
    const formData = new FormData();
    formData.set("echo", "hello from a test");
    const request = new Request("http://localhost/", { method: "POST", body: formData });
    const result = await action({ request } as never);
    expect(result.echo).toBe("hello from a test");
  });

  it("action returns null echo when the field is missing", async () => {
    const formData = new FormData();
    const request = new Request("http://localhost/", { method: "POST", body: formData });
    const result = await action({ request } as never);
    expect(result.echo).toBeNull();
  });
});
