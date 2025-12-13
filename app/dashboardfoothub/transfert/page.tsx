"use client";

import RequestToJoinClubCard from "@/features/requesttojoinclub/component/RequestToJoinClubCard";
import CoachApplicationsCard from "@/features/requesttojoinclub/component/CoachApplicationsCard";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { Loader2, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function TransfertPage() {
  const { data: clubData, isPending } = useInfosClub();
  const router = useRouter();

  const role = clubData?.role;
  const isCoach = role === "ENTRAINEUR";
  const isPlayerWithClub = role === "JOUEUR";
  const isNoClub = role === "SANSCLUB" || !role;
  const teamId = clubData?.equipe?.id;

  // Redirect players with a club away from this page
  useEffect(() => {
    if (!isPending && isPlayerWithClub) {
      router.replace("/dashboardfoothub");
    }
  }, [isPending, isPlayerWithClub, router]);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }

  // Show access denied message while redirecting
  if (isPlayerWithClub) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Accès non autorisé
        </h3>
        <p className="text-sm text-zinc-500 mt-2">
          Vous avez déjà un club. Cette page est réservée aux personnes sans
          club ou aux entraîneurs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Coach: Show received applications */}
      {isCoach && teamId && <CoachApplicationsCard teamId={teamId} />}

      {/* No club: Show their own applications */}
      {isNoClub && <RequestToJoinClubCard />}
    </div>
  );
}

export default TransfertPage;
