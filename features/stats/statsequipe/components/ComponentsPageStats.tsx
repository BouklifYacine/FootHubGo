"use client";
import React from "react";
import { UseStatistiqueEquipeID } from "../hooks/useStatistiqueEquipe";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { UseStatistiqueJoueur } from "@/features/stats/statsjoueur/hooks/useStatistiquesJoueur";
import SkeletonBlockStats from "@/features/stats/statsjoueur/components/SkeletonBlockStatsJoueur";
import { FullStatsTeamSkeleton } from "./FullStatsTeamSkeleton";
import BlockStatsJoueur from "@/features/stats/statsjoueur/components/BlockStatsJoueur";
import BlockStatsEquipe from "@/features/stats/statsequipe/components/BlockStatsEquipe";
import FullStatsTeam from "./FullStatsTeam";

function ComponentsPageStats() {
  const { data: clubData, isLoading: clubLoading } = useInfosClub();
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } = UseStatistiqueEquipeID(clubData?.equipe.id);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } =  UseStatistiqueJoueur();

  const isLoading = clubLoading || statsEquipeLoading || statsJoueurLoading;

  if (isLoading) {
    return (
      <div>
        <SkeletonBlockStats />
        <FullStatsTeamSkeleton />
      </div>
    );
  }

  const role = clubData?.role;
  const idEquipe = clubData?.equipe?.id;

  return (
    <>
      {role === "JOUEUR" ? (
        <BlockStatsJoueur statsJoueurData={statsJoueurData} />
      ) : (
        <>
          {idEquipe ? (
            <>
              <BlockStatsEquipe StatsEquipeData={StatsEquipeData} />
              <FullStatsTeam StatsEquipeData={StatsEquipeData} />
            </>
          ) : (
            <p className="text-center text-4xl">
              Aucune équipe trouvée pour ce club
            </p>
          )}
        </>
      )}
    </>
  );
}

export default ComponentsPageStats;