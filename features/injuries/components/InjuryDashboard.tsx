"use client";

import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { CoachInjuryTable } from "./CoachInjuryTable";
import { CreateInjuryDialog } from "./CreateInjuryDialog";
import { InjuryHeader } from "./InjuryHeader";
import { PlayerInjury } from "./PlayerInjury";

export const InjuryDashboard = ({ sessionId }: { sessionId: string }) => {
  const { data: clubData, isLoading } = useInfosClub();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clubData) {
    return null;
  }

  const isCoach = clubData.role === "ENTRAINEUR" || clubData.role === "Admin";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b dark:border-zinc-800 pb-6">
        <InjuryHeader />
        <CreateInjuryDialog sessionId={sessionId} />
      </div>

      {isCoach ? (
        <CoachInjuryTable clubId={clubData.equipe.id} />
      ) : (
        <PlayerInjury sessionId={sessionId} />
      )}
    </div>
  );
};
