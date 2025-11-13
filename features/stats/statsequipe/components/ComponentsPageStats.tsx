"use client";
import React from "react";
import { UseStatistiqueEquipeID } from "../hooks/useStatistiqueEquipe";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { UseStatistiqueJoueur } from "@/features/stats/statsjoueur/hooks/useStatistiquesJoueur";
import FullStatsTeam from "./FullStatsTeam";
import FullStatsPlayer from "../../statsjoueur/components/FullStatsPlayer";
import ChartsStatsPlayer from "../../statsjoueur/components/ChartsStatsPlayer";
import TeamInfo from "./TeamInfo";
import PlayerInfo from "../../statsjoueur/components/PlayerInfo";
import ChartsStatsTeam from "./ChartStatsTeam";
import TeamInfoSkeleton from "../../statsjoueur/components/TeamInfoSkeleton";
import ChartsStatsTeamSkeleton from "./ChartsStatsTeamSkeleton";
import FullStatsTeamSkeleton from "./FullStatsTeamSkeleton";

function ComponentsPageStats() {
  const { data: clubData, isLoading: clubLoading } = useInfosClub();
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } = UseStatistiqueEquipeID(clubData?.equipe.id);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } = UseStatistiqueJoueur();

  const TeamName = clubData?.equipe.nom;
  const isLoading = clubLoading || statsEquipeLoading || statsJoueurLoading;

  // Vérifie si les stats joueur sont vides
  const PlayerHasNoStats = statsJoueurData?.statsjoueur.totalmatch == 0;

  console.log(PlayerHasNoStats)

  // Vérifie si les stats équipe sont vides
  // const hasTeamStats = StatsEquipeData && StatsEquipeData.statsequipe.totalMatch == 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row justify-evenly gap-4 items-center">
        <TeamInfoSkeleton />
        <ChartsStatsTeamSkeleton />
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
          <div className="min-h-screen flex flex-col lg:flex-row justify-evenly gap-4 items-center">
            {PlayerHasNoStats ? (
              <>
                <p>Participez a un match pour voir vos statistiques</p>
              </>
            ) : (
              <>
                <PlayerInfo statsJoueurData={statsJoueurData} />
                <ChartsStatsPlayer statsJoueurData={statsJoueurData} />
                <FullStatsPlayer statsJoueurData={statsJoueurData} />
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {idEquipe ? (
            <>
              <div className="min-h-screen flex flex-col lg:flex-row justify-evenly gap-4 items-center">
                <TeamInfo
                  StatsEquipeData={StatsEquipeData}
                  TeamName={TeamName}
                />
                <ChartsStatsTeam StatsEquipeData={StatsEquipeData} />
                <FullStatsTeam StatsEquipeData={StatsEquipeData} />
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
