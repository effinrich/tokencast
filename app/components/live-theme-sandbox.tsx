import { useState, type ReactNode } from "react";

import { Button, Card, Input, Link } from "~/components/ui";
import { cn } from "~/lib/cn";
import type { PreviewTheme } from "~/lib/tokens/preview-mapping";
import { readableTextColor } from "~/lib/tokens/readable-text-color";

interface LiveThemeSandboxProps {
  preview: PreviewTheme;
}

function SandboxSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </section>
  );
}

export function LiveThemeSandbox({ preview }: LiveThemeSandboxProps) {
  const [demoTab, setDemoTab] = useState<"tokens" | "system">("tokens");

  const primaryColor = preview.primary ?? "#3b82f6";
  const accentColor = preview.accent ?? preview.primary ?? "#3b82f6";
  const radius = preview.radius ?? "8px";
  const buttonPadding = preview.spacing ? `0.5rem ${preview.spacing}` : "0.5rem 1.25rem";

  return (
    <div className="w-full max-w-xl space-y-8" data-testid="live-preview">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Using: {preview.usedTokens.join(", ") || "no tokens found"}
      </p>

      <SandboxSection title="Themed from your tokens">
        <div className="flex flex-wrap items-center gap-3">
          <button
            style={{
              backgroundColor: primaryColor,
              borderRadius: radius,
              padding: buttonPadding,
              color: readableTextColor(primaryColor),
            }}
            className="min-h-11 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Primary button
          </button>
          <span
            style={{
              backgroundColor: accentColor,
              borderRadius: "999px",
              color: readableTextColor(accentColor),
            }}
            className="inline-flex min-h-11 items-center px-3 text-xs font-bold"
          >
            Accent badge
          </span>
        </div>
        <Card style={{ borderRadius: radius }} className="bg-elevated">
          <h4 className="mb-1 text-base font-semibold">Themed card</h4>
          <p className="text-sm text-secondary">
            Border radius comes from your first parsed radius token.
          </p>
        </Card>
      </SandboxSection>

      <SandboxSection title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </SandboxSection>

      <SandboxSection title="Typography">
        <div className="space-y-1">
          <p className="text-base font-semibold text-primary">Primary heading text</p>
          <p className="text-sm text-secondary">Secondary body copy for descriptions and labels.</p>
          <p className="text-xs text-muted">Muted caption or helper text.</p>
        </div>
      </SandboxSection>

      <SandboxSection title="Surfaces">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface p-4 shadow-subtle">
            <p className="text-xs font-medium text-primary">Surface</p>
            <p className="text-xs text-muted">Default card tier</p>
          </div>
          <div className="rounded-lg bg-elevated p-4 shadow-subtle">
            <p className="text-xs font-medium text-primary">Elevated</p>
            <p className="text-xs text-muted">Raised panels</p>
          </div>
          <div className="rounded-lg bg-inset p-4 shadow-subtle">
            <p className="text-xs font-medium text-primary">Inset</p>
            <p className="text-xs text-muted">Recessed wells</p>
          </div>
        </div>
      </SandboxSection>

      <SandboxSection title="Inputs">
        <div className="space-y-3">
          <Input
            style={{ borderRadius: radius }}
            placeholder="Placeholder text"
            readOnly
            aria-label="Input preview"
          />
          <Input
            style={{ borderRadius: radius }}
            defaultValue="Filled value"
            readOnly
            aria-label="Filled input preview"
          />
          <Input
            style={{ borderRadius: radius }}
            placeholder="Disabled input"
            disabled
            aria-label="Disabled input preview"
          />
        </div>
      </SandboxSection>

      <SandboxSection title="Links">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#">Accent link</Link>
          <Link href="#" className="text-secondary hover:text-primary">
            Secondary link
          </Link>
        </div>
      </SandboxSection>

      <SandboxSection title="Segmented control">
        <div
          className="flex rounded-lg bg-elevated p-1 shadow-subtle"
          role="tablist"
          aria-label="Sandbox demo tabs"
        >
          {(
            [
              ["tokens", "Your tokens"],
              ["system", "System UI"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              onClick={() => setDemoTab(id)}
              aria-selected={demoTab === id}
              className={cn(
                "min-h-11 flex-1 rounded-md text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                demoTab === id
                  ? "bg-surface text-primary shadow-subtle"
                  : "text-secondary hover:text-primary",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-secondary">
          {demoTab === "tokens"
            ? "Elements above styled from pasted token values."
            : "Foundation primitives using Tokencast semantic tokens."}
        </p>
      </SandboxSection>

      <SandboxSection title="Semantic status">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-9 items-center rounded-md bg-success-muted px-3 text-xs font-semibold text-success">
            Success
          </span>
          <span className="inline-flex min-h-9 items-center rounded-md bg-warning-muted px-3 text-xs font-semibold text-warning">
            Warning
          </span>
          <span className="inline-flex min-h-9 items-center rounded-md bg-error-muted px-3 text-xs font-semibold text-error">
            Error
          </span>
        </div>
        <div className="rounded-lg bg-success-muted p-3 text-sm text-success">
          Parse succeeded — tokens mapped to preview.
        </div>
      </SandboxSection>

      <SandboxSection title="Code">
        <p className="text-sm text-secondary">
          Inline <code className="rounded-md bg-inset px-1.5 py-0.5 font-mono text-xs text-primary">code</code>{" "}
          uses the inset surface.
        </p>
        <Card className="bg-inset p-4 font-mono text-xs leading-relaxed text-secondary shadow-none">
          <pre>{`--color-brand: ${primaryColor};\n--radius-md: ${radius};`}</pre>
        </Card>
      </SandboxSection>
    </div>
  );
}
