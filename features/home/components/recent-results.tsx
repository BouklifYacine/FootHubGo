import Link from "next/link";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { SectionTitle } from "@/components/app/page-header";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MatchResult } from "@/generated/prisma/browser";
import type { HomeData } from "../types";

const resultStyles: Record<MatchResult, { letter: string; label: string; className: string }> = {
  WIN: { letter: "V", label: "Victoire", className: "bg-success text-success-foreground" },
  DRAW: { letter: "N", label: "Match nul", className: "bg-muted-foreground text-background" },
  LOSS: { letter: "D", label: "Défaite", className: "bg-destructive text-white" },
};

/** Last results with the score written out (no tooltip), and the player's rating. */
export function RecentResults({ results, isPlayer }: { results: HomeData["recentResults"]; isPlayer: boolean }) {
  return (
    <section className="space-y-2" aria-labelledby="results-title">
      <SectionTitle>
        <span id="results-title">Derniers résultats</span>
      </SectionTitle>
      {results.length === 0 ? (
        <EmptyState icon={Activity} title="Aucun match joué" description="Les résultats s'afficheront ici après les premiers matchs." />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {results.map((match) => {
            const style = resultStyles[match.result];
            return (
              <li key={match.id}>
                <Link
                  href={`/app/events/${match.id}`}
                  className="flex min-h-12 items-center gap-3 px-4 py-2 outline-none hover:bg-accent/60 focus-visible:bg-accent"
                >
                  <span
                    className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", style.className)}
                    aria-label={style.label}
                    title={style.label}
                  >
                    {style.letter}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{match.opponent}</span>
                    <span className="block text-xs text-muted-foreground">{formatDate(match.startDate)}</span>
                  </span>
                  {isPlayer && match.rating !== null && (
                    <span className="text-xs text-muted-foreground">Note {match.rating}</span>
                  )}
                  <span className="text-base font-semibold tabular-nums">
                    {match.goalsFor} - {match.goalsAgainst}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
