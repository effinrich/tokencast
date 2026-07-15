import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export type PageProps = HTMLAttributes<HTMLDivElement>;

/** Standard page container: max-width, px-6, space-y-6 vertical rhythm. */
export function Page({ className, children, ...props }: PageProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-2xl space-y-6 px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
