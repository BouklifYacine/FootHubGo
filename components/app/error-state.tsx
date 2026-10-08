import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** The error (its message comes from the API and is already in French). */
  error?: Error | null;
  title?: string;
  /** Usually the query's `refetch`. */
  onRetry?: () => void;
  className?: string;
};

/** A failed load: what happened + "Réessayer". */
export function ErrorState({ error, title = "Impossible de charger cette page", onRetry, className }: Props) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center", className)}>
      <CircleAlert className="size-8 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {error?.message && <p className="text-sm text-muted-foreground">{error.message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={() => onRetry()}>
          <RotateCw /> Réessayer
        </Button>
      )}
    </div>
  );
}
