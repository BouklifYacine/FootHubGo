import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: ReactNode;
  /** The page's primary action (one button, or a small group). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Title of an app page. Under `md` the visible title is the one of the top bar (same text, from
 * `lib/navigation.ts`), so the `h1` stays for screen readers only and the description + actions show.
 */
export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        // Nothing visible under md (the top bar shows the title): no empty gap either.
        !description && !actions && "max-md:sr-only",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight max-md:sr-only">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 max-md:[&>*]:grow">{actions}</div>}
    </header>
  );
}

/** Title of a block inside a page ("À faire", "Prochain match"...). */
export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

/** Standard vertical rhythm of a page: header, then blocks separated by `gap-6`. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full max-w-5xl flex-col gap-6", className)}>{children}</div>;
}
