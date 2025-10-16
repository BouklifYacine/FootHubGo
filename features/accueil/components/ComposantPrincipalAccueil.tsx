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
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } =
    UseStatistiqueEquipeID(clubData?.equipe.id);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } =
    UseStatistiqueJoueur();
  const { data: session } = authClient.useSession();

  const HasNoClub = data?.role === "SANSCLUB" || data?.role === undefined;
  const recentmatch = data?.matches.recent;
  const Role = data?.role;

  const TopScorers = data?.leaderboards.topScorers;
  const TopAssists = data?.leaderboards.topAssisters;
  const TeamName = clubData?.equipe.nom;

  if (isLoading || clubLoading || statsEquipeLoading || statsJoueurLoading)
    return "Ca charge";

  if (HasNoClub) {
    return <NoClub />;
  }

  return (
    <div>
      <p className="text-2xl tracking-tight font-medium">
        Bienvenue {session?.user.name}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 container mx-auto mt-10">
        {/* Ligne 1 */}
        <div className="md:col-span-2 border-2 border-gray-300 rounded-3xl p-6">
          <ResultLastFiveMatches Role={data!.role} recentmatch={recentmatch} />
        </div>
        <div className="border-2 border-gray-300 rounded-3xl p-6">
          <InfosTeamAccueil clubData={clubData} Role={data!.role} />
        </div>

        {/* Ligne 2 */}
        <div className="md:col-span-2 border-2 border-gray-300 rounded-3xl p-6">
          <StatsPrincipal
            Role={Role}
            StatsEquipeData={StatsEquipeData}
            statsJoueurData={statsJoueurData}
          />
        </div>
        <div className="border-2 border-gray-300 rounded-3xl p-6">
          <LeaderboardTeam TopAssists={TopAssists} TopScorers={TopScorers} />
        </div>

        {/* Ligne 3 */}
        <div className="border-2 border-gray-300 rounded-3xl p-6">
          <NextEventsClub data={data} TeamName={TeamName} />
        </div>

        <div className="md:col-span-2 border-2 border-gray-300 rounded-3xl p-6 flex justify-center">
          <NextThreeEvents data={data} />
        </div>
      </div>
    </div>
  );
}

export default ComposantPrincipalAccueil;
