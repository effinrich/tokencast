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

## Status

Early — scaffold + tooling live, token parser and UI in progress.

## Tech stack

- React Router (framework mode: SSR, loaders, actions, file-based routes)
- React 19, TypeScript (strict)
- Tailwind CSS 4
- Vitest (unit) + Testing Library + Playwright (e2e)
- ESLint + Prettier
- Supabase (Save & Share persistence, added in a later phase)
- Deployed on Vercel

## Development

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # production build
pnpm start        # run the production server locally
pnpm typecheck    # react-router typegen && tsc
pnpm lint         # eslint .
pnpm test         # vitest run
pnpm test:e2e     # playwright test
```

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
