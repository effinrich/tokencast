import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createShare, loadShare, ShareRateLimitError } from "./share.server";
import { emptyTokenModel } from "./model";

// Real integration tests against the live Supabase project — no mocks. Each
// test uses a unique fake client IP so the rate-limit window (5/60s, shared
// per IP) doesn't make tests interfere with each other. Test rows are left
// in place (the anon-key client this app uses in production has no delete
// path by design — see supabase/migrations/) and periodically cleaned up
// out-of-band via the Supabase dashboard/MCP, not by the test suite itself.
const hasSupabaseEnv = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;

describe.skipIf(!hasSupabaseEnv)("Save & Share — live Supabase integration", () => {
  it("saves a real token set and loads it back via a fresh client call", async () => {
    const model = {
      ...emptyTokenModel(),
      colors: [{ name: "brand", value: "#3b82f6" }],
      spacing: [{ name: "md", value: "1rem" }],
    };

    const slug = await createShare(model, `test-ip-${randomUUID()}`);
    expect(slug).toMatch(/^[a-f0-9]{10}$/);

    const loaded = await loadShare(slug);
    expect(loaded).not.toBeNull();
    expect(loaded!.colors).toEqual([{ name: "brand", value: "#3b82f6" }]);
    expect(loaded!.spacing).toEqual([{ name: "md", value: "1rem" }]);
  });

  it("returns null for a slug that was never saved", async () => {
    const loaded = await loadShare("does-not-exist-at-all");
    expect(loaded).toBeNull();
  });

  it("neutralizes an XSS-shaped token name in both storage and retrieval", async () => {
    const xss = "<script>alert(1)</script>";
    const model = {
      ...emptyTokenModel(),
      colors: [{ name: xss, value: "#000000" }],
    };

    const slug = await createShare(model, `test-ip-${randomUUID()}`);
    const loaded = await loadShare(slug);

    expect(loaded!.colors[0].name).not.toContain("<script>");
    expect(loaded!.colors[0].name).not.toContain("<");
  });

  it("throws a typed rate-limit error after 5 saves from the same IP within a minute", async () => {
    const ip = `test-ratelimit-${randomUUID()}`;
    const model = { ...emptyTokenModel(), colors: [{ name: "x", value: "#fff" }] };

    for (let i = 0; i < 5; i++) {
      await createShare(model, ip);
    }

    await expect(createShare(model, ip)).rejects.toBeInstanceOf(ShareRateLimitError);
  }, 20_000);
});
