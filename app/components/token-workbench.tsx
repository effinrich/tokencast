import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { LiveThemeSandbox } from "./live-theme-sandbox";
import { Button, Link } from "~/components/ui";
import { cn } from "~/lib/cn";
import { parseFigmaTokens } from "../lib/tokens/parse-figma-tokens";
import { parseCssVars } from "../lib/tokens/parse-css-vars";
import { parseTailwindConfig } from "../lib/tokens/parse-tailwind-config";
import { generateTailwindTheme } from "../lib/tokens/generate-tailwind-theme";
import { generateChakraTheme } from "../lib/tokens/generate-chakra-theme";
import { generateShadcnVars } from "../lib/tokens/generate-shadcn-vars";
import { mapToPreviewTheme } from "../lib/tokens/preview-mapping";
import { TokenParseError } from "../lib/tokens/errors";
import type { TokenModel } from "../lib/tokens/model";
import type { action as homeAction } from "../routes/home";

type Format = "figma" | "css" | "tailwind";
type ExportFormat = "tailwind" | "chakra" | "shadcn";

const FORMAT_LABELS: Record<Format, string> = {
  figma: "Figma tokens (JSON)",
  css: "CSS custom properties",
  tailwind: "Tailwind config (theme.extend)",
};

const EXPORT_LABELS: Record<ExportFormat, string> = {
  tailwind: "Tailwind",
  chakra: "Chakra",
  shadcn: "shadcn/ui",
};

const SAMPLE_INPUT: Record<Format, string> = {
  figma: `{
  "global": {
    "color": {
      "brand": { "value": "#3b82f6", "type": "color" },
      "accent": { "value": "#f43f5e", "type": "color" }
    },
    "spacing": {
      "md": { "value": "1rem", "type": "spacing" }
    },
    "radius": {
      "md": { "value": "8px", "type": "borderRadius" }
    }
  }
}`,
  css: `:root {
  --color-brand: #3b82f6;
  --color-accent: #f43f5e;
  --spacing-md: 1rem;
  --radius-md: 8px;
}`,
  tailwind: `{
  "theme": {
    "extend": {
      "colors": { "brand": "#3b82f6", "accent": "#f43f5e" },
      "spacing": { "md": "1rem" },
      "borderRadius": { "md": "8px" }
    }
  }
}`,
};

function parseByFormat(format: Format, raw: string): TokenModel {
  switch (format) {
    case "figma":
      return parseFigmaTokens(raw);
    case "css":
      return parseCssVars(raw);
    case "tailwind":
      return parseTailwindConfig(raw);
  }
}

function generateExport(format: ExportFormat, model: TokenModel): string {
  switch (format) {
    case "tailwind":
      return generateTailwindTheme(model);
    case "chakra":
      return generateChakraTheme(model);
    case "shadcn":
      return generateShadcnVars(model);
  }
}

interface TokenWorkbenchProps {
  /** When set, the workbench opens on a fixed, previously-shared token set. */
  initialModel?: TokenModel;
  /** Shown as a banner when viewing a shared conversion. */
  readOnlyBanner?: string;
}

export function TokenWorkbench({ initialModel, readOnlyBanner }: TokenWorkbenchProps) {
  const isSharedView = !!initialModel;
  const [format, setFormat] = useState<Format>("figma");
  const [raw, setRaw] = useState(
    initialModel ? JSON.stringify(initialModel, null, 2) : SAMPLE_INPUT.figma,
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>("tailwind");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const shareFetcher = useFetcher<typeof homeAction>();

  const { model, error } = useMemo(() => {
    if (isSharedView) return { model: initialModel!, error: null as TokenParseError | null };
    try {
      return { model: parseByFormat(format, raw), error: null as TokenParseError | null };
    } catch (err) {
      if (err instanceof TokenParseError) return { model: null, error: err };
      throw err;
    }
  }, [isSharedView, initialModel, format, raw]);

  const preview = model ? mapToPreviewTheme(model) : null;
  const exportOutput = model ? generateExport(exportFormat, model) : null;

  function handleFormatChange(next: Format) {
    setFormat(next);
    setRaw(SAMPLE_INPUT[next]);
  }

  async function handleCopy() {
    if (!exportOutput) return;
    try {
      await navigator.clipboard.writeText(exportOutput);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed — select and copy manually");
    }
    setTimeout(() => setCopyStatus(null), 2000);
  }

  function handleDownload() {
    if (!exportOutput) return;
    const extension = exportFormat === "chakra" ? "ts" : "css";
    const blob = new Blob([exportOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokencast-theme.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveAndShare() {
    if (!model) return;
    const formData = new FormData();
    formData.set("model", JSON.stringify(model));
    shareFetcher.submit(formData, { method: "post", action: "/?index" });
  }

  const shareResult = shareFetcher.data;
  const shareUrl =
    shareResult?.ok && typeof window !== "undefined"
      ? `${window.location.origin}/t/${shareResult.slug}`
      : null;
  const isSaving = shareFetcher.state !== "idle";

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-primary md:h-dvh md:overflow-hidden">
      <div className="sticky top-0 z-30 shrink-0 bg-canvas">
        <header className="flex items-center justify-between bg-surface px-6 py-3 shadow-subtle">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
              T
            </span>
            <h1 className="text-sm font-semibold tracking-tight">Tokencast</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/docs" className="text-secondary hover:text-primary">
              Docs
            </Link>
            <Link
              href="https://github.com/effinrich/tokencast"
              className="text-secondary hover:text-primary"
            >
              GitHub
            </Link>
          </nav>
        </header>

        {readOnlyBanner && (
          <div className="flex items-center justify-between border-b border-accent/20 bg-accent-muted px-6 py-2 text-sm text-accent-foreground">
            <span>{readOnlyBanner}</span>
            <Link href="/" className="min-h-0 py-0 text-accent-foreground underline hover:text-accent-foreground/80">
              Start a new conversion
            </Link>
          </div>
        )}
      </div>

      <main className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Left: Input — pinned on desktop; textarea scrolls inside the column */}
        <section className="flex w-full min-h-0 flex-col bg-inset md:w-1/3 md:overflow-hidden md:border-r md:border-surface">
          <div className="flex shrink-0 items-center justify-between px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
              Design tokens
            </h2>
            {!isSharedView && (
              <select
                aria-label="Token input format"
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as Format)}
                className="min-h-11 cursor-pointer appearance-none rounded-md bg-elevated px-3 text-sm text-primary shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            )}
          </div>
          <textarea
            aria-label="Paste your design tokens"
            spellCheck={false}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            readOnly={isSharedView}
            placeholder="Paste your token data here…"
            className="min-h-48 flex-1 resize-none overflow-y-auto bg-transparent px-6 pb-6 font-mono text-sm leading-relaxed text-secondary outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:min-h-0"
          />
          {error && (
            <div
              role="alert"
              data-testid="parse-error"
              className="mx-6 mb-6 shrink-0 rounded-lg bg-error-muted p-4 text-sm text-error shadow-subtle"
            >
              <p className="mb-1 font-semibold">Couldn&apos;t parse that input</p>
              <p>{error.message}</p>
            </div>
          )}
        </section>

        {/* Middle: Live preview — sole vertical scroll region on desktop */}
        <section className="flex min-h-0 flex-1 flex-col bg-canvas md:overflow-y-auto">
          <div className="shrink-0 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
              Live theme sandbox
            </h2>
          </div>
          <div className="flex justify-center px-6 pb-6 pt-2">
            {preview ? (
              <LiveThemeSandbox preview={preview} />
            ) : (
              <p className="self-center text-sm text-muted">
                Fix the input error to see a live preview.
              </p>
            )}
          </div>
        </section>

        {/* Right: Export — pinned on desktop; output scrolls inside the column */}
        <section className="flex w-full min-h-0 flex-col bg-inset md:w-1/3 md:overflow-hidden md:border-l md:border-surface">
          <div className="shrink-0 space-y-4 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
              Transpiled output
            </h2>
            <div
              className="flex rounded-lg bg-elevated p-1 shadow-subtle"
              role="tablist"
              aria-label="Export format"
            >
              {(Object.keys(EXPORT_LABELS) as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  onClick={() => setExportFormat(f)}
                  aria-pressed={exportFormat === f}
                  aria-selected={exportFormat === f}
                  className={cn(
                    "min-h-11 flex-1 rounded-md text-xs font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                    exportFormat === f
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-secondary hover:text-primary",
                  )}
                >
                  {EXPORT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <pre
            data-testid="export-output"
            className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-6 pb-6 font-mono text-sm leading-relaxed text-success"
          >
            {exportOutput ?? "// Fix the input error to see generated output"}
          </pre>
          <div className="shrink-0 space-y-2 bg-surface px-6 py-4 shadow-subtle">
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!exportOutput}
                className="flex-1"
              >
                {copyStatus ?? "Copy configuration"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownload}
                disabled={!exportOutput}
                aria-label="Download configuration"
              >
                Download
              </Button>
            </div>
            {!isSharedView && (
              <Button
                variant="ghost"
                onClick={handleSaveAndShare}
                disabled={!model || isSaving}
                className="w-full border border-surface"
              >
                {isSaving ? "Saving…" : "Save & share"}
              </Button>
            )}
            {shareResult && !shareResult.ok && (
              <p role="alert" data-testid="share-error" className="text-sm text-error">
                {shareResult.error}
              </p>
            )}
            {shareUrl && (
              <div data-testid="share-url" className="break-all text-sm text-success">
                Saved:{" "}
                <Link href={shareUrl} className="min-h-0 py-0 underline">
                  {shareUrl}
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="flex h-8 shrink-0 items-center gap-2 bg-inset px-6 text-xs font-medium uppercase tracking-wider text-muted">
        <span
          data-testid="status-bar"
          className={error ? "text-error" : "text-success"}
        >
          {error ? "Parse error" : "Parsed successfully"}
        </span>
        <span aria-hidden>·</span>
        <span>{isSharedView ? "Shared view" : FORMAT_LABELS[format]}</span>
      </footer>
    </div>
  );
}
