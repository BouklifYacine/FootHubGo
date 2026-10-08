import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  /** list: rows with an avatar; cards: a grid of cards; detail: a header and a few blocks. */
  variant?: "list" | "cards" | "detail";
  rows?: number;
  className?: string;
};

/** The one loading placeholder of the app (skeletons, no spinners or "Chargement..." texts). */
export function LoadingState({ variant = "list", rows = 4, className }: Props) {
  return (
    <div role="status" aria-live="polite" className={cn("w-full", className)}>
      <span className="sr-only">Chargement…</span>
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border p-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      )}
      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
      )}
      {variant === "detail" && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}
    </div>
  );
}
