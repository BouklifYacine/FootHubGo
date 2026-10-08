import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { SectionTitle } from "@/components/app/page-header";
import type { HomeData } from "../types";

type Stat = { label: string; value: string | number };

/** Team totals for a coach, the player's own totals for a player. */
export function KeyStats({ teamStats, playerStats }: Pick<HomeData, "teamStats" | "playerStats">) {
  const stats: Stat[] | null = playerStats
    ? playerStats.matches === 0
      ? null
      : [
          { label: "Matchs", value: playerStats.matches },
          { label: "Buts", value: playerStats.goals },
          { label: "Passes D.", value: playerStats.assists },
          { label: "Minutes", value: playerStats.minutesPlayed },
          { label: "Note moy.", value: playerStats.averageRating?.toFixed(1) ?? "-" },
          { label: "Buts + passes", value: playerStats.contributions },
        ]
    : teamStats.matches === 0
      ? null
      : [
          { label: "Matchs", value: teamStats.matches },
          { label: "Victoires", value: teamStats.wins },
          { label: "Nuls", value: teamStats.draws },
          { label: "Défaites", value: teamStats.losses },
          { label: "Points", value: teamStats.points },
          { label: "% victoires", value: `${teamStats.winRate}%` },
        ];

  return (
    <section className="space-y-2" aria-labelledby="stats-title">
      <SectionTitle
        action={
          <Link href="/app/stats" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            {playerStats ? "Mes stats" : "Stats de l'équipe"}
          </Link>
        }
      >
        <span id="stats-title">{playerStats ? "Ma saison" : "La saison"}</span>
      </SectionTitle>
      {stats ? (
        <dl className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-3">
              <dd className="text-xl font-semibold tabular-nums">{value}</dd>
              <dt className="truncate text-xs text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      ) : (
        <EmptyState icon={BarChart3} title="Pas encore de statistiques" description="Elles apparaîtront après les premiers matchs." />
      )}
    </section>
  );
}
