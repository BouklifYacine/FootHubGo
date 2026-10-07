"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { JoinTeamDialog } from "@/features/team/components/join-team-dialog";
import { TeamFormDialog } from "@/features/team/components/team-form-dialog";
import { TeamDirectory } from "@/features/join-requests/components/team-directory";
import { useHome } from "../hooks/use-home";
import { KeyStats } from "./key-stats";
import { Leaderboard } from "./leaderboard";
import { RecentResults } from "./recent-results";
import { TeamCard } from "./team-card";
import { UpcomingMatches } from "./upcoming-matches";

export function HomeDashboard() {
  const { data, isPending, error } = useHome();
  const { data: session } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }
  if (error) return <p className="p-5 text-red-500">{error.message}</p>;
  if (!data) return <NoTeam />;

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <h1 className="mb-6 text-xl font-medium tracking-tight sm:text-2xl lg:mb-10 lg:text-3xl">
        Bienvenue {session?.user.name}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        <Tile>
          <TeamCard team={data.team} />
        </Tile>
        <Tile wide>
          <RecentResults results={data.recentResults} isPlayer={data.role === "PLAYER"} />
        </Tile>
        <Tile wide>
          <KeyStats teamStats={data.teamStats} playerStats={data.playerStats} />
        </Tile>
        <Tile>
          <Leaderboard topScorers={data.topScorers} topAssists={data.topAssists} />
        </Tile>
        <Tile className="lg:col-span-3">
          <UpcomingMatches matches={data.upcomingMatches} teamName={data.team.name} />
        </Tile>
      </div>
    </div>
  );
}

function Tile({ wide, className, children }: { wide?: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-gray-300 p-4 sm:p-5 lg:rounded-3xl lg:p-6",
        wide && "lg:col-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Home of a user without a team: create one, join one with a code, or apply to a club. */
function NoTeam() {
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setCreating(true)}>
          Créer un club
          <Plus className="ml-1 opacity-60" />
        </Button>
        <JoinTeamDialog />
      </div>
      <TeamFormDialog open={creating} onOpenChange={setCreating} />
      <TeamDirectory />
    </div>
  );
}
