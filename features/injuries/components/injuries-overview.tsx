"use client";

import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { authClient } from "@/lib/auth-client";
import { InjuryFormDialog } from "./injury-form-dialog";
import { PlayerInjuries } from "./player-injuries";
import { TeamInjuriesTable } from "./team-injuries-table";

/** /app/injuries: squad status for the coach, own injury history for a player. */
export function InjuriesOverview() {
  const { data: session, isPending } = authClient.useSession();
  const { data: myTeam, isLoading, error, refetch } = useMyTeam();

  if (isPending || isLoading) return <LoadingState className="mx-auto max-w-5xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!myTeam?.team || !session) return null;

  const isCoach = myTeam.role === "COACH";

  return (
    <Page>
      <PageHeader
        title="Blessures"
        description={
          isCoach
            ? "Qui est apte, qui est blessé et jusqu'à quand."
            : "Déclare une blessure : ton coach est prévenu et ne te convoque pas pendant ce temps."
        }
        actions={!isCoach && <InjuryFormDialog />}
      />
      {isCoach ? <TeamInjuriesTable teamId={myTeam.team.id} /> : <PlayerInjuries userId={session.user.id} />}
    </Page>
  );
}
