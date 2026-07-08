import { useMemo, useState } from "react";
import { parseFigmaTokens } from "../lib/tokens/parse-figma-tokens";
import { parseCssVars } from "../lib/tokens/parse-css-vars";
import { parseTailwindConfig } from "../lib/tokens/parse-tailwind-config";
import { generateTailwindTheme } from "../lib/tokens/generate-tailwind-theme";
import { generateChakraTheme } from "../lib/tokens/generate-chakra-theme";
import { generateShadcnVars } from "../lib/tokens/generate-shadcn-vars";
import { mapToPreviewTheme } from "../lib/tokens/preview-mapping";
import { readableTextColor } from "../lib/tokens/readable-text-color";
import { TokenParseError } from "../lib/tokens/errors";
import type { TokenModel } from "../lib/tokens/model";

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

export function TokenWorkbench() {
  const [format, setFormat] = useState<Format>("figma");
  const [raw, setRaw] = useState(SAMPLE_INPUT.figma);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("tailwind");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const { model, error } = useMemo(() => {
    try {
      return { model: parseByFormat(format, raw), error: null as TokenParseError | null };
    } catch (err) {
      if (err instanceof TokenParseError) return { model: null, error: err };
      throw err;
    }
  }, [format, raw]);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            T
          </div>
          <h1 className="text-sm font-semibold tracking-tight">Tokencast</h1>
        </div>
        <a
          href="https://github.com/effinrich/tokencast"
          className="text-white/50 hover:text-white text-xs transition-colors"
        >
          GitHub
        </a>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Input */}
      <section className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0c0c0e]">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
            Design tokens
          </h2>
          <select
            aria-label="Token input format"
            value={format}
            onChange={(e) => handleFormatChange(e.target.value as Format)}
            className="appearance-none bg-white/5 border border-white/10 text-[11px] px-3 py-1 rounded-md cursor-pointer"
          >
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <textarea
          aria-label="Paste your design tokens"
          spellCheck={false}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Paste your token data here…"
          className="flex-1 p-6 bg-transparent font-mono text-[13px] leading-relaxed text-blue-100/80 outline-none resize-none placeholder:text-white/20"
        />
        {error && (
          <div
            role="alert"
            data-testid="parse-error"
            className="m-4 mt-0 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs"
          >
            <p className="font-semibold mb-1">Couldn't parse that input</p>
            <p>{error.message}</p>
          </div>
        )}
      </section>

      {/* Middle: Live preview */}
      <section className="flex-1 flex flex-col bg-[#09090b]">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
            Live theme sandbox
          </h2>
        </div>
        <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
          {preview ? (
            <div className="w-full max-w-xl space-y-8" data-testid="live-preview">
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.2em]">
                Using: {preview.usedTokens.join(", ") || "no tokens found"}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  style={{
                    backgroundColor: preview.primary ?? "#3b82f6",
                    borderRadius: preview.radius ?? "8px",
                    padding: preview.spacing ? `0.5rem ${preview.spacing}` : "0.5rem 1.25rem",
                    color: readableTextColor(preview.primary ?? "#3b82f6"),
                  }}
                  className="text-sm font-medium"
                >
                  Primary button
                </button>
                <span
                  style={{
                    backgroundColor: preview.accent ?? preview.primary ?? "#3b82f6",
                    borderRadius: "999px",
                    color: readableTextColor(preview.accent ?? preview.primary ?? "#3b82f6"),
                  }}
                  className="px-3 py-1 text-[11px] font-bold"
                >
                  Badge
                </span>
              </div>
              <div
                style={{ borderRadius: preview.radius ?? "8px" }}
                className="bg-[#121215] border border-white/10 p-6"
              >
                <h3 className="text-base font-semibold mb-2">Card preview</h3>
                <p className="text-sm text-white/50">
                  This card and the elements above are themed live from your pasted tokens.
                </p>
              </div>
              <input
                style={{ borderRadius: preview.radius ?? "8px" }}
                className="w-full bg-[#18181b] border border-white/10 px-4 py-3 text-sm placeholder:text-white/50"
                placeholder="Input preview"
                readOnly
              />
            </div>
          ) : (
            <p className="text-white/50 text-sm">Fix the input error to see a live preview.</p>
          )}
        </div>
      </section>

      {/* Right: Export */}
      <section className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 flex flex-col bg-[#0c0c0e]">
        <div className="p-4 flex flex-col border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
            Transpiled output
          </h2>
          <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
            {(Object.keys(EXPORT_LABELS) as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                aria-pressed={exportFormat === f}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                  exportFormat === f ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {EXPORT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <pre
          data-testid="export-output"
          className="flex-1 p-6 font-mono text-[12px] leading-relaxed text-emerald-400/90 overflow-auto whitespace-pre-wrap"
        >
          {exportOutput ?? "// Fix the input error to see generated output"}
        </pre>
        <div className="p-4 bg-[#09090b] border-t border-white/10 flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!exportOutput}
            className="flex-1 py-2.5 bg-white text-black text-xs font-bold rounded-lg disabled:opacity-40"
          >
            {copyStatus ?? "Copy configuration"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!exportOutput}
            aria-label="Download configuration"
            className="p-2.5 border border-white/10 rounded-lg text-white/60 disabled:opacity-40"
          >
            Download
          </button>
        </div>
      </section>
      </main>

      <footer className="h-8 border-t border-white/10 px-4 flex items-center gap-2 text-[10px] text-white/60 font-medium uppercase tracking-wider">
        <span data-testid="status-bar" className={error ? "text-rose-400" : "text-emerald-400"}>
          {error ? "Parse error" : "Parsed successfully"}
        </span>
        <span>·</span>
        <span>{FORMAT_LABELS[format]}</span>
      </footer>
    </div>
  );
}
