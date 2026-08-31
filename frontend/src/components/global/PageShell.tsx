import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  /** Search inputs, create buttons, filters — rendered on the right of the header row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Standard page container for every authenticated screen: a solid card with a
 * bordered header row. Replaces the ad-hoc blurred glass panels that each page
 * used to declare for itself.
 */
const PageShell = ({ title, description, actions, children, className }: PageShellProps) => {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>
          ) : null}
        </div>

        <div className="space-y-6 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default PageShell;
