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
import FullStatsPlayer from "../../statsjoueur/components/FullStatsPlayer";
import ChartsStatsPlayer from "../../statsjoueur/components/ChartsStatsPlayer";
import TeamInfo from "./TeamInfo";
import PlayerInfo from "../../statsjoueur/components/PlayerInfo";

function ComponentsPageStats() {
  const { data: clubData, isLoading: clubLoading } = useInfosClub();
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } = UseStatistiqueEquipeID(clubData?.equipe.id);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } = UseStatistiqueJoueur();

  const TeamName = clubData?.equipe.nom

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
     <div className="">
          <div className="  min-h-screen flex flex-col md:flex-row justify-evenly gap-4 items-center ">
            <PlayerInfo statsJoueurData={statsJoueurData}></PlayerInfo>
           <ChartsStatsPlayer statsJoueurData={statsJoueurData}></ChartsStatsPlayer>
              <FullStatsPlayer statsJoueurData={statsJoueurData}></FullStatsPlayer>
          </div>
          </div>
     
      ) : (
        <>
          {idEquipe ? (
            <>
            <div>
              {/* <BlockStatsEquipe StatsEquipeData={StatsEquipeData} /> */}
              <FullStatsTeam StatsEquipeData={StatsEquipeData} />
              <TeamInfo StatsEquipeData={StatsEquipeData} TeamName={TeamName}></TeamInfo>
              </div>
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
