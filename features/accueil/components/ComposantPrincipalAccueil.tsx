"use client";
import React from "react";
import { UseDataAccueil } from "../hooks/UseDataAccueil";
import NoClub from "./NoClub";
import ResultLastFiveMatches from "./ResultLastFiveMatches";
import LeaderboardTeam from "./LeaderboardTeam";
import StatsPrincipal from "./StatsPrincipal";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { UseStatistiqueEquipeID } from "@/features/stats/statsequipe/hooks/useStatistiqueEquipe";
import { UseStatistiqueJoueur } from "@/features/stats/statsjoueur/hooks/useStatistiquesJoueur";
import NextEventsClub from "./NextEventsClub";
import InfosTeamAccueil from "./InfosTeamAccueil";
import { authClient } from "@/lib/auth-client";
import NextThreeEvents from "./NextThreeEvents";

function ComposantPrincipalAccueil() {
  const { data, isLoading } = UseDataAccueil();
  const { data: clubData, isLoading: clubLoading } = useInfosClub();
  const equipeId = clubData?.equipe?.id;
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } =
    UseStatistiqueEquipeID(equipeId);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } =
    UseStatistiqueJoueur();
  const { data: session } = authClient.useSession();

  const HasNoClub = data?.role === "SANSCLUB" || data?.role === undefined;
  const recentmatch = data?.matches.recent;
  const Role = data?.role;

  const TopScorers = data?.leaderboards.topScorers;
  const TopAssists = data?.leaderboards.topAssisters;
  const TeamName = clubData?.equipe?.nom ?? "";

  if (isLoading || clubLoading || statsEquipeLoading || statsJoueurLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Chargement...</p>
      </div>
    );

  if (HasNoClub) {
    return <NoClub />;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Titre */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl tracking-tight font-medium mb-6 lg:mb-10">
        Bienvenue {session?.user.name} 
      </h1>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        
        {/* ROW 1 : Infos équipe (1 colonne sur 3) */}
        <div className="lg:col-span-1 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
          <InfosTeamAccueil clubData={clubData} Role={data!.role} />
        </div>

        {/* ROW 1 : Derniers résultats (2 colonnes sur 3) */}
        <div className="lg:col-span-2 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
          <ResultLastFiveMatches Role={data!.role} recentmatch={recentmatch} />
        </div>

        {/* ROW 2 : Stats principales (2 colonnes sur 3) */}
        <div className="lg:col-span-2 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
          <StatsPrincipal
            Role={Role}
            StatsEquipeData={StatsEquipeData}
            statsJoueurData={statsJoueurData}
          />
        </div>

        {/* ROW 2 : Classements (1 colonne sur 3) */}
        <div className="lg:col-span-1 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
          <LeaderboardTeam TopAssists={TopAssists} TopScorers={TopScorers} />
        </div>

        {/* ROW 3 : Prochain match (1 colonne sur 3) */}
        <div className="lg:col-span-1 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
          <NextEventsClub data={data} TeamName={TeamName} />
        </div>

        {/* ROW 3 : 3 prochains événements (2 colonnes sur 3) */}
        <div className="lg:col-span-2 border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 flex justify-center">
          <NextThreeEvents data={data} />
        </div>
      </div>
    </div>
  );
}

export default ComposantPrincipalAccueil;
