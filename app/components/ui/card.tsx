import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** Surface tone + subtle shadow — no border-as-elevation. */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface p-6 shadow-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
