"use client";

import { InjuryHeader } from "@/features/injuries/components/InjuryHeader";
import { CreateInjuryDialog } from "@/features/injuries/components/CreateInjuryDialog";
import { CoachInjuryTable } from "@/features/injuries/components/CoachInjuryTable";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { authClient } from "@/lib/auth-client";
import { PlayerInjury } from "@/features/injuries/components/PlayerInjury";

export default function InjuryPage() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const { data: clubData, isLoading } = useInfosClub();

  if (isPending || isLoading) {
    return <div>Chargement...</div>;
  }

  if (!clubData || !session?.user.id) {
    return null;
  }

  const isCoach = clubData.role === "ENTRAINEUR" || clubData.role === "Admin";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b dark:border-zinc-800 pb-6">
        <InjuryHeader isCoach={isCoach} />
        {!isCoach && <CreateInjuryDialog sessionId={session.user.id} />}
      </div>

      {isCoach ? (
        <CoachInjuryTable clubId={clubData.equipe.id} />
      ) : (
        <PlayerInjury sessionId={session.user.id} />
      )}
    </div>
  );
}
