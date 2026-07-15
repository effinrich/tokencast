import { Card, Link, Page } from "~/components/ui";
import type { Route } from "./+types/docs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Docs — Tokencast" },
    {
      name: "description",
      content: "How Tokencast works: input formats, exports, Save & Share, and architecture.",
    },
  ];
}

const SECTIONS = [
  { id: "what-is-this", label: "What is this" },
  { id: "input-formats", label: "Input formats" },
  { id: "live-preview", label: "How the live preview works" },
  { id: "export-formats", label: "Export formats" },
  { id: "save-share", label: "Save & Share" },
  { id: "architecture", label: "Architecture" },
  { id: "running-locally", label: "Running it locally" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <Card className="overflow-x-auto bg-inset p-4 font-mono text-xs leading-relaxed text-secondary shadow-none">
      <pre>{children}</pre>
    </Card>
  );
}

export default function Docs() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-primary">
      <header className="flex items-center justify-between bg-surface px-6 py-3 shadow-subtle">
        <Link href="/" className="gap-2 font-semibold tracking-tight text-primary hover:text-primary">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
            T
          </span>
          Tokencast
        </Link>
        <Link href="/" className="text-secondary hover:text-primary">
          Back to the tool
        </Link>
      </header>

      <main className="flex-1 py-10">
        <Page className="max-w-2xl space-y-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Docs</h1>
            <p className="text-secondary leading-relaxed">
              What Tokencast does, exactly how it parses and exports, and how Save &amp;
              Share works under the hood — for visitors and for future-me.
            </p>
          </header>

          <Card className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              On this page
            </p>
            <ul className="space-y-1 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link href={`#${s.id}`} className="min-h-9 py-1 text-accent hover:text-accent/80">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <section id="what-is-this" className="space-y-3">
            <h2 className="text-xl font-semibold">What is this</h2>
            <p className="leading-relaxed text-secondary">
              Tokencast turns design tokens — whatever format they&apos;re currently in —
              into a live-previewed theme and exportable code for Tailwind, Chakra
              UI, or shadcn/ui. It&apos;s built for the moment a design system exists in
              one tool&apos;s format and you need it in another, without hand-translating
              every color and spacing value.
            </p>
          </section>

          <section id="input-formats" className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Input formats</h2>
              <p className="leading-relaxed text-secondary">
                Three formats are supported. Pick one from the dropdown in the input
                panel — each parser expects its own real-world shape, not a generic
                token format:
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Figma tokens (JSON)</h3>
              <p className="text-sm text-secondary">
                The Tokens Studio / Figma Tokens plugin export shape — nested groups of{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">
                  {"{ value, type }"}
                </code>{" "}
                leaves:
              </p>
              <CodeBlock>
                {`{
  "global": {
    "color": {
      "brand": { "value": "#3b82f6", "type": "color" }
    },
    "spacing": {
      "md": { "value": "1rem", "type": "spacing" }
    }
  }
}`}
              </CodeBlock>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">CSS custom properties</h3>
              <p className="text-sm text-secondary">
                A <code className="rounded bg-inset px-1 font-mono text-primary">:root {"{ }"}</code>{" "}
                block using a{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">
                  --&lt;category&gt;-&lt;name&gt;
                </code>{" "}
                naming convention (category is one of color, spacing, radius, shadow, font-size):
              </p>
              <CodeBlock>
                {`:root {
  --color-brand: #3b82f6;
  --spacing-md: 1rem;
}`}
              </CodeBlock>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Tailwind config</h3>
              <p className="text-sm text-secondary">
                The <code className="rounded bg-inset px-1 font-mono text-primary">theme.extend</code>{" "}
                object as JSON (not a live JS config file with functions/imports — paste the extend
                object itself):
              </p>
              <CodeBlock>
                {`{
  "theme": {
    "extend": {
      "colors": { "brand": "#3b82f6" },
      "spacing": { "md": "1rem" }
    }
  }
}`}
              </CodeBlock>
            </div>
          </section>

          <section id="live-preview" className="space-y-3">
            <h2 className="text-xl font-semibold">How the live preview works</h2>
            <p className="leading-relaxed text-secondary">
              The preview is a simple, honest heuristic, not semantic detection: the{" "}
              <strong className="font-semibold text-primary">first color</strong> parsed becomes the
              primary button color, the{" "}
              <strong className="font-semibold text-primary">second color</strong> becomes the
              badge/accent color, and the{" "}
              <strong className="font-semibold text-primary">first spacing and radius</strong> values
              get applied to padding and corners. The &quot;Using: ...&quot; line above the
              preview always states exactly which tokens were picked.
            </p>
            <p className="leading-relaxed text-secondary">
              Text color on the themed elements is computed from the real WCAG
              contrast formula against both black and white, picking whichever wins —
              not a naive &quot;is this dark&quot; guess, which gets several common brand
              colors wrong (e.g. Tailwind&apos;s own blue-500 and rose-500 both read as
              &quot;dark enough for white text&quot; by eye, but their actual contrast ratio
              against white is under the 4.5:1 AA minimum).
            </p>
          </section>

          <section id="export-formats" className="space-y-3">
            <h2 className="text-xl font-semibold">Export formats</h2>
            <ul className="list-inside list-disc space-y-2 leading-relaxed text-secondary">
              <li>
                <strong className="font-semibold text-primary">Tailwind</strong> — a CSS-native{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">@theme {"{ }"}</code>{" "}
                block (Tailwind v4&apos;s current config format, not the older JS config).
              </li>
              <li>
                <strong className="font-semibold text-primary">Chakra</strong> — a plain JS/TS module
                exporting a theme object (
                <code className="rounded bg-inset px-1 font-mono text-primary">colors</code>,{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">space</code>,{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">radii</code>,{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">shadows</code>).
              </li>
              <li>
                <strong className="font-semibold text-primary">shadcn/ui</strong> — a plain{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">:root {"{ }"}</code>{" "}
                CSS variables block. This is a direct token→variable bridge, not a semantic remap
                to shadcn&apos;s background/primary/etc. naming — that mapping needs a
                human decision about what each token means, which isn&apos;t this tool&apos;s
                job.
              </li>
            </ul>
          </section>

          <section id="save-share" className="space-y-3">
            <h2 className="text-xl font-semibold">Save &amp; Share</h2>
            <p className="leading-relaxed text-secondary">
              &quot;Save &amp; share&quot; persists your parsed tokens to a real database and gives
              you back a link (
              <code className="rounded bg-inset px-1 font-mono text-primary">/t/&lt;slug&gt;</code>
              ) that reloads the exact same preview and export for anyone who visits it
              — including you, later, in a different browser.
            </p>
            <ul className="list-inside list-disc space-y-2 leading-relaxed text-secondary">
              <li>No account needed — saves are anonymous.</li>
              <li>Payloads are capped at 20KB.</li>
              <li>5 saves per minute per connection, then a short cooldown.</li>
              <li>
                Saved conversions aren&apos;t deleted automatically yet — the retention
                policy (30 days) exists but isn&apos;t wired to a scheduled job. Don&apos;t
                treat a share link as permanent.
              </li>
              <li>
                Token names/values are sanitized before storage and on every render
                — a token literally named{" "}
                <code className="rounded bg-inset px-1 font-mono text-primary">
                  {"<script>alert(1)</script>"}
                </code>{" "}
                is inert everywhere it could show up.
              </li>
            </ul>
          </section>

          <section id="architecture" className="space-y-3">
            <h2 className="text-xl font-semibold">Architecture</h2>
            <ul className="list-inside list-disc space-y-2 leading-relaxed text-secondary">
              <li>
                <strong className="font-semibold text-primary">React Router, framework mode</strong> —
                server-rendered, real loaders and actions. The home route&apos;s action
                handles Save; the <code className="rounded bg-inset px-1 font-mono text-primary">/t/:slug</code> route&apos;s
                loader handles Share, server-side, every time.
              </li>
              <li>
                <strong className="font-semibold text-primary">Supabase, RPC-only</strong> — the two
                database tables have Row Level Security enabled with{" "}
                <strong className="font-semibold text-primary">zero</strong> policies. The app&apos;s public
                key can only call two narrow database functions (save one, read one by
                exact slug) — it can&apos;t list or query the tables directly, so it can&apos;t
                enumerate other people&apos;s saved shares.
              </li>
              <li>
                <strong className="font-semibold text-primary">No secrets in the browser</strong> — the
                Supabase client only exists in server-rendered code; the shipped
                client bundle has zero references to it, verified directly against
                the built output.
              </li>
            </ul>
          </section>

          <section id="running-locally" className="space-y-3">
            <h2 className="text-xl font-semibold">Running it locally</h2>
            <CodeBlock>
              {`git clone https://github.com/effinrich/tokencast
cd tokencast
pnpm install
cp .env.example .env
pnpm dev`}
            </CodeBlock>
            <p className="text-sm text-secondary">
              The example env file already has a working public anon key and project
              URL — Save &amp; Share works out of the box, no setup needed. See the{" "}
              <Link
                href="https://github.com/effinrich/tokencast#readme"
                className="min-h-0 py-0 underline"
              >
                README
              </Link>{" "}
              for the full command list.
            </p>
          </section>
        </Page>
      </main>

      <footer className="flex h-11 items-center bg-surface px-6 shadow-subtle">
        <Link href="/" className="text-xs font-medium uppercase tracking-wider text-muted hover:text-primary">
          Back to Tokencast
        </Link>
      </footer>
    </div>
  );
}
