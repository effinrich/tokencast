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

export default function Docs() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#09090b]">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            T
          </div>
          <span className="text-sm font-semibold tracking-tight">Tokencast</span>
        </a>
        <a href="/" className="text-white/60 hover:text-white text-xs transition-colors">
          Back to the tool
        </a>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Docs</h1>
        <p className="text-white/60 mb-10">
          What Tokencast does, exactly how it parses and exports, and how Save &
          Share works under the hood — for visitors and for future-me.
        </p>

        <nav className="mb-10 border border-white/10 rounded-lg p-4 text-sm">
          <p className="text-white/60 uppercase text-[11px] tracking-wider mb-2">On this page</p>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-blue-400 hover:text-blue-300">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="what-is-this" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">What is this</h2>
          <p className="text-white/80 leading-relaxed">
            Tokencast turns design tokens — whatever format they're currently in —
            into a live-previewed theme and exportable code for Tailwind, Chakra
            UI, or shadcn/ui. It's built for the moment a design system exists in
            one tool's format and you need it in another, without hand-translating
            every color and spacing value.
          </p>
        </section>

        <section id="input-formats" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Input formats</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Three formats are supported. Pick one from the dropdown in the input
            panel — each parser expects its own real-world shape, not a generic
            token format:
          </p>

          <h3 className="text-sm font-semibold text-white/90 mb-2">
            Figma tokens (JSON)
          </h3>
          <p className="text-white/60 text-sm mb-2">
            The Tokens Studio / Figma Tokens plugin export shape — nested groups of{" "}
            <code className="text-white/90">{"{ value, type }"}</code> leaves:
          </p>
          <pre className="bg-[#121215] border border-white/10 rounded-lg p-4 text-xs overflow-x-auto mb-6">
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
          </pre>

          <h3 className="text-sm font-semibold text-white/90 mb-2">
            CSS custom properties
          </h3>
          <p className="text-white/60 text-sm mb-2">
            A <code className="text-white/90">:root {"{ }"}</code> block using a{" "}
            <code className="text-white/90">--&lt;category&gt;-&lt;name&gt;</code> naming
            convention (category is one of color, spacing, radius, shadow, font-size):
          </p>
          <pre className="bg-[#121215] border border-white/10 rounded-lg p-4 text-xs overflow-x-auto mb-6">
            {`:root {
  --color-brand: #3b82f6;
  --spacing-md: 1rem;
}`}
          </pre>

          <h3 className="text-sm font-semibold text-white/90 mb-2">
            Tailwind config
          </h3>
          <p className="text-white/60 text-sm mb-2">
            The <code className="text-white/90">theme.extend</code> object as JSON
            (not a live JS config file with functions/imports — paste the extend
            object itself):
          </p>
          <pre className="bg-[#121215] border border-white/10 rounded-lg p-4 text-xs overflow-x-auto">
            {`{
  "theme": {
    "extend": {
      "colors": { "brand": "#3b82f6" },
      "spacing": { "md": "1rem" }
    }
  }
}`}
          </pre>
        </section>

        <section id="live-preview" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">How the live preview works</h2>
          <p className="text-white/80 leading-relaxed mb-3">
            The preview is a simple, honest heuristic, not semantic detection: the{" "}
            <strong className="text-white">first color</strong> parsed becomes the
            primary button color, the <strong className="text-white">second color</strong>{" "}
            becomes the badge/accent color, and the{" "}
            <strong className="text-white">first spacing and radius</strong> values
            get applied to padding and corners. The "Using: ..." line above the
            preview always states exactly which tokens were picked.
          </p>
          <p className="text-white/80 leading-relaxed">
            Text color on the themed elements is computed from the real WCAG
            contrast formula against both black and white, picking whichever wins —
            not a naive "is this dark" guess, which gets several common brand
            colors wrong (e.g. Tailwind's own blue-500 and rose-500 both read as
            "dark enough for white text" by eye, but their actual contrast ratio
            against white is under the 4.5:1 AA minimum).
          </p>
        </section>

        <section id="export-formats" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Export formats</h2>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2">
            <li>
              <strong className="text-white">Tailwind</strong> — a CSS-native{" "}
              <code className="text-white/90">@theme {"{ }"}</code> block (Tailwind
              v4's current config format, not the older JS config).
            </li>
            <li>
              <strong className="text-white">Chakra</strong> — a plain JS/TS module
              exporting a theme object (<code className="text-white/90">colors</code>,{" "}
              <code className="text-white/90">space</code>,{" "}
              <code className="text-white/90">radii</code>,{" "}
              <code className="text-white/90">shadows</code>).
            </li>
            <li>
              <strong className="text-white">shadcn/ui</strong> — a plain{" "}
              <code className="text-white/90">:root {"{ }"}</code> CSS variables
              block. This is a direct token→variable bridge, not a semantic remap
              to shadcn's background/primary/etc. naming — that mapping needs a
              human decision about what each token means, which isn't this tool's
              job.
            </li>
          </ul>
        </section>

        <section id="save-share" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Save & Share</h2>
          <p className="text-white/80 leading-relaxed mb-3">
            "Save & share" persists your parsed tokens to a real database and gives
            you back a link (<code className="text-white/90">/t/&lt;slug&gt;</code>)
            that reloads the exact same preview and export for anyone who visits it
            — including you, later, in a different browser.
          </p>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2">
            <li>No account needed — saves are anonymous.</li>
            <li>Payloads are capped at 20KB.</li>
            <li>5 saves per minute per connection, then a short cooldown.</li>
            <li>
              Saved conversions aren't deleted automatically yet — the retention
              policy (30 days) exists but isn't wired to a scheduled job. Don't
              treat a share link as permanent.
            </li>
            <li>
              Token names/values are sanitized before storage and on every render
              — a token literally named{" "}
              <code className="text-white/90">{"<script>alert(1)</script>"}</code>{" "}
              is inert everywhere it could show up.
            </li>
          </ul>
        </section>

        <section id="architecture" className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Architecture</h2>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2">
            <li>
              <strong className="text-white">React Router, framework mode</strong> —
              server-rendered, real loaders and actions. The home route's action
              handles Save; the <code className="text-white/90">/t/:slug</code> route's
              loader handles Share, server-side, every time.
            </li>
            <li>
              <strong className="text-white">Supabase, RPC-only</strong> — the two
              database tables have Row Level Security enabled with{" "}
              <strong className="text-white">zero</strong> policies. The app's public
              key can only call two narrow database functions (save one, read one by
              exact slug) — it can't list or query the tables directly, so it can't
              enumerate other people's saved shares.
            </li>
            <li>
              <strong className="text-white">No secrets in the browser</strong> — the
              Supabase client only exists in server-rendered code; the shipped
              client bundle has zero references to it, verified directly against
              the built output.
            </li>
          </ul>
        </section>

        <section id="running-locally">
          <h2 className="text-lg font-semibold mb-3">Running it locally</h2>
          <pre className="bg-[#121215] border border-white/10 rounded-lg p-4 text-xs overflow-x-auto mb-3">
            {`git clone https://github.com/effinrich/tokencast
cd tokencast
pnpm install
cp .env.example .env
pnpm dev`}
          </pre>
          <p className="text-white/60 text-sm">
            The example env file already has a working public anon key and project
            URL — Save & Share works out of the box, no setup needed. See the{" "}
            <a
              href="https://github.com/effinrich/tokencast#readme"
              className="text-blue-400 underline"
            >
              README
            </a>{" "}
            for the full command list.
          </p>
        </section>
      </main>

      <footer className="h-8 border-t border-white/10 px-4 flex items-center text-[10px] text-white/60 font-medium uppercase tracking-wider">
        <a href="/" className="hover:text-white/60">
          Back to Tokencast
        </a>
      </footer>
    </div>
  );
}
