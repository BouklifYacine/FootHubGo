"use client";

import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { authClient } from "@/lib/auth-client";
import { InjuryFormDialog } from "./injury-form-dialog";
import { PlayerInjuries } from "./player-injuries";
import { TeamInjuriesTable } from "./team-injuries-table";

/** /app/injuries: squad status for the coach, own injury history for a player. */
export function InjuriesOverview() {
  const { data: session, isPending } = authClient.useSession();
  const { data: myTeam, isLoading } = useMyTeam();

  if (isPending || isLoading) return <div>Chargement...</div>;
  if (!myTeam?.team || !session) return null;

  const isCoach = myTeam.role === "COACH";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            {isCoach ? "Gestion des blessures" : "Suivi des blessures"}
          </h1>
          <p className="opacity-70 text-md font-medium">
            {isCoach
              ? "Suivez l'état de santé de votre effectif."
              : "Gérez votre état de santé et informez l'entraîneur de votre disponibilité."}
          </p>
        </div>
        {!isCoach && <InjuryFormDialog />}
      </div>

      {isCoach ? <TeamInjuriesTable teamId={myTeam.team.id} /> : <PlayerInjuries userId={session.user.id} />}
    </div>
  );
}
