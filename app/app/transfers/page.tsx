"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { MyJoinRequests } from "@/features/join-requests/components/my-join-requests";
import { TeamDirectory } from "@/features/join-requests/components/team-directory";
import { TeamJoinRequests } from "@/features/join-requests/components/team-join-requests";

/** Coaches review the requests they received; players without a club follow theirs and browse clubs. */
export default function TransfersPage() {
  const router = useRouter();
  const { data, isPending } = useMyTeam();
  const isPlayerWithTeam = data?.role === "PLAYER";

  useEffect(() => {
    if (isPlayerWithTeam) router.replace("/app");
  }, [isPlayerWithTeam, router]);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isPlayerWithTeam) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <ShieldX className="size-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold">Accès non autorisé</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Vous avez déjà un club. Cette page est réservée aux personnes sans club ou aux entraîneurs.
        </p>
      </div>
    );
  }

  if (data?.role === "COACH" && data.team) {
    return <TeamJoinRequests teamId={data.team.id} />;
  }

  return (
    <div className="space-y-10">
      <MyJoinRequests />
      <TeamDirectory />
    </div>
  );
}
