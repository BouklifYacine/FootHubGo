import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MatchResult } from "@/generated/prisma/browser";
import type { HomeData } from "../types";
import { EmptyState } from "./empty-state";

const resultStyles: Record<MatchResult, { letter: string; className: string }> = {
  WIN: { letter: "V", className: "bg-emerald-400 hover:bg-emerald-600" },
  DRAW: { letter: "N", className: "bg-yellow-500 hover:bg-yellow-700" },
  LOSS: { letter: "D", className: "bg-red-500 hover:bg-red-700" },
};

function ratingColor(rating: number) {
  if (rating >= 7.5) return "bg-emerald-400 hover:bg-emerald-600";
  if (rating >= 6) return "bg-green-700 hover:bg-green-900";
  return "bg-red-500 hover:bg-red-700";
}

const circle = "flex size-10 items-center justify-center rounded-full text-md font-bold md:size-14 md:text-xl";

export function RecentResults({ results, isPlayer }: { results: HomeData["recentResults"]; isPlayer: boolean }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Aucun match joué"
        text="Les 5 derniers matchs s'afficheront ici après les premières rencontres"
      />
    );
  }

  const ratings = results.flatMap((r) => (r.rating === null ? [] : [r.rating]));
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;

  return (
    <div>
      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg font-medium tracking-tighter sm:text-xl lg:text-2xl">5 derniers matchs</h2>
        {isPlayer && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium tracking-tighter sm:text-xl">Note moyenne :</span>
            <Badge className={cn(average === null ? "bg-gray-400" : ratingColor(average), "rounded-2xl md:text-lg")}>
              {average === null ? "?" : average.toFixed(2)}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 px-2 pb-4 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        {results.map((match) => (
          <div key={match.id} className="flex flex-col items-center space-y-1 p-2 sm:min-w-[100px] sm:space-y-2">
            <p className="max-w-[110px] truncate text-center text-xs font-semibold sm:text-sm">{match.opponent}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {new Date(match.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={cn(resultStyles[match.result].className, circle)}>
                    {resultStyles[match.result].letter}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Score : {match.goalsFor} - {match.goalsAgainst}
                </TooltipContent>
              </Tooltip>
              {isPlayer && (
                <>
                  <span className="text-sm opacity-60 sm:text-lg lg:text-2xl">|</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn(match.rating === null ? "bg-gray-400" : ratingColor(match.rating), circle)}>
                        {match.rating ?? "?"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Note du match</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
