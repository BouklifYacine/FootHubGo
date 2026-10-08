import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = { label: string; href?: string; onClick?: () => void; icon?: LucideIcon };

type Props = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** The next step, e.g. "Créer un événement" (a link or a callback), or any element. */
  action?: Action | ReactNode;
  className?: string;
  /** Lighter version inside a card (no dashed border). */
  bare?: boolean;
};

const isAction = (value: unknown): value is Action =>
  typeof value === "object" && value !== null && "label" in value;

/** "Nothing here yet" + what to do about it. */
export function EmptyState({ icon: Icon, title, description, action, className, bare }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-4 py-10 text-center",
        !bare && "rounded-xl border border-dashed",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {isAction(action) ? (
        action.href ? (
          <Button asChild className="mt-1">
            <Link href={action.href}>
              {action.icon && <action.icon />} {action.label}
            </Link>
          </Button>
        ) : (
          <Button className="mt-1" onClick={action.onClick}>
            {action.icon && <action.icon />} {action.label}
          </Button>
        )
      ) : (
        action
      )}
    </div>
  );
}
