import type { AnchorHTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** Touch-safe inline link with focus-visible ring. */
export function Link({ className, ...props }: LinkProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center text-sm text-accent transition-colors hover:text-accent/80",
        "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
      {...props}
    />
  );
}
