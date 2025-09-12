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

  console.log(data?.matches.recent)
  console.log(data?.matches.upcoming)

  const TopScorers = data?.leaderboards.topScorers;
  const TopAssists = data?.leaderboards.topAssisters;

  if (isLoading) return "Ca charge ";

  if (HasNoClub) {
    return <NoClub></NoClub>;
  }

  return (
    <>
      {" "}
      <div>
        <ResultLastFiveMatches
          Role={data!.role}
          recentmatch={recentmatch}
        ></ResultLastFiveMatches>
        <LeaderboardTeam
          TopScorers={TopScorers}
          TopAssists={TopAssists}
        ></LeaderboardTeam>
        <StatsPrincipal
          statsJoueurData={statsJoueurData}
          StatsEquipeData={StatsEquipeData}
          Role={data!.role}
        ></StatsPrincipal>
        {/* <NextEventsClub></NextEventsClub> */}
        <InfosTeamAccueil></InfosTeamAccueil>
      </div>
    </>
  );
}

export default ComposantPrincipalAccueil;
