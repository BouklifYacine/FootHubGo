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

function ComposantPrincipalAccueil() {
  const { data, isLoading } = UseDataAccueil();
  const { data: clubData, isLoading: clubLoading } = useInfosClub();
  const { data: StatsEquipeData, isLoading: statsEquipeLoading } =
    UseStatistiqueEquipeID(clubData?.equipe.id);
  const { data: statsJoueurData, isLoading: statsJoueurLoading } =
    UseStatistiqueJoueur();

  const HasNoClub = data?.role === "SANSCLUB";
  const recentmatch = data?.matches.recent;

  const TopScorers = data?.leaderboards.topScorers;
  const TopAssists = data?.leaderboards.topAssisters;
  const TeamName = clubData?.equipe.nom;

  if (isLoading) return "Ca charge ";

  if (HasNoClub) {
    return <NoClub></NoClub>;
  }

  return (
    <div>
      <p className="text-2xl">Bienvenue Yacine Bouklif</p>
      <div className="grid grid-cols-1 md:grid-cols-3  gap-6 container mx-auto mt-10">
      {/* Ligne 1 */}
      <div className="md:col-span-2 bg-red-500 rounded-3xl flex items-center justify-center">A (large)</div>
      <div className="bg-green-500 rounded-3xl "><InfosTeamAccueil
            clubData={clubData}
            Role={data!.role}
          ></InfosTeamAccueil></div>

      {/* Ligne 2 */}
      <div className="bg-blue-500 rounded-3xl flex items-center justify-center">C</div>
      <div className="md:col-span-2 bg-yellow-500 rounded-3xl flex items-center justify-center">D (large)</div>

      {/* Ligne 3 */}
      <div className="bg-purple-500 rounded-3xl flex items-center justify-center">E</div>
      <div className="md:col-span-2 bg-pink-500 rounded-3xl flex items-center justify-center">F (large)</div>
    </div>
    </div>
  );
}

export default ComposantPrincipalAccueil;
