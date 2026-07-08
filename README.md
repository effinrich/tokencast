# Tokencast

Paste your design tokens — Figma variables export, CSS custom properties, or a
Tailwind config — get a live preview and exportable theme code (Tailwind, Chakra,
shadcn/ui). Save a conversion and get a shareable link back to it.

Built by [Rich Tillman](https://richtillman.xyz) — creator of
[ForgeKit](https://forgekit.cloud).

## Why React Router (framework mode)

This app is built on **React Router in framework mode** (loaders, actions, SSR) —
the current, Remix-team-recommended path for a new Remix-style app. Remix and React
Router merged; new projects start on React Router now rather than legacy Remix v2,
and it's not the unrelated non-React Remix v3 rewrite. The home route's loader +
action round-trip (see `app/routes/home.tsx`) is a genuine server-side data flow,
not a client-rendered stub — that round-trip is what the Save & Share feature later
builds on for real.

## Live

**[tokencast.vercel.app](https://tokencast.vercel.app)** — paste tokens, get a live
preview and export code, save a conversion and get back a real, server-rendered
shareable link. Lighthouse: 100 accessibility, 99 performance.

## Tech stack

- React Router (framework mode: SSR, loaders, actions, file-based routes)
- React 19, TypeScript (strict)
- Tailwind CSS 4
- Vitest (unit + live integration tests) + Testing Library + Playwright (e2e)
- ESLint + Prettier
- Supabase (Save & Share persistence)
- Deployed on Vercel

## Development

```sh
pnpm install
cp .env.example .env   # public anon key + project URL, safe to copy as-is
pnpm dev          # http://localhost:5173
pnpm build        # production build
pnpm start        # run the production server locally
pnpm typecheck    # react-router typegen && tsc
pnpm lint         # eslint .
pnpm test         # vitest run — includes live Supabase integration tests
pnpm test:e2e     # playwright test
```

## Save & Share — architecture and security

The home route's action persists a parsed token model to Supabase and returns
a shareable slug; `/t/:slug`'s loader server-loads it back for anyone visiting
the link cold — see `app/routes/home.tsx` and `app/routes/share.tsx`.

**No direct table access, ever.** Both `token_shares` and
`tokencast_share_rate_limit` have RLS enabled with **zero** policies — not
even a scoped one. The only way the app's anon key can touch either table is
through two `SECURITY DEFINER` RPCs (`supabase/migrations/`):

- `create_token_share(payload, client_ip)` — validates payload size (also
  enforced by a DB `CHECK` constraint as defense in depth beyond the app-layer
  check in `app/lib/tokens/validate-model.ts`), rate-limits by IP (5 saves per
  60s, tracked in `tokencast_share_rate_limit`), inserts, returns a slug.
- `get_token_share(slug)` — returns exactly one row by exact slug match. There
  is no anon `SELECT` policy on the table itself, so the anon key cannot list
  or enumerate other users' saved shares — only fetch one by its exact slug.

**Sanitization.** Token names/values are stripped of `<>"'` (see
`app/lib/tokens/sanitize.ts`) before ever being persisted — defense in depth
on top of React's default JSX escaping, so a token named
`<script>alert(1)</script>` is inert in storage, in the live preview, and in
every generated export string.

**Rate limiting** is Supabase-backed (a table + a per-IP count check inside
the RPC), not in-memory — in-memory counters don't survive across Vercel's
serverless function instances, so they'd silently stop working in production.

**Data retention.** Saved shares and rate-limit rows aren't cleaned up
automatically yet. The policy (see the migration files): delete
`token_shares` older than 30 days, `tokencast_share_rate_limit` rows older
than 1 day. Enforcing it is a follow-up — wire the two `delete` statements in
`supabase/migrations/20260708200000_create_tokencast_share_tables.sql` into a
Supabase Cron job.

## Custom domain (manual follow-up)

This project deploys to a Vercel-issued `*.vercel.app` URL automatically. To point
`tokencast.richtillman.xyz` at it:

1. In the Vercel project's **Settings → Domains**, add `tokencast.richtillman.xyz`
   and copy the CNAME target Vercel gives you.
2. In Cloudflare (where `richtillman.xyz` is managed), add a CNAME record:
   - **Name:** `tokencast`
   - **Target:** the value from step 1 (typically `cname.vercel-dns.com`)
   - **Proxy status:** DNS only (grey cloud), so Vercel's own TLS/CDN handles it
3. Wait for DNS propagation, then verify the domain in Vercel's dashboard.

This step isn't automated — no Cloudflare access is wired into this build.
