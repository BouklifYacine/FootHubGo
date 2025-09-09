"use client";
import React from "react";
import { UseDataAccueil } from "../hooks/UseDataAccueil";
import NoClub from "./NoClub";
import ResultLastFiveMatches from "./ResultLastFiveMatches";

function ComposantPrincipalAccueil() {
  const { data, isLoading } = UseDataAccueil();

  console.log(data?.matches.recent.map((p) => p.statsJoueur))

  const Coach = data?.role === "ENTRAINEUR";
  const Player = data?.role === "JOUEUR";
  const HasNoClub = data?.role === "SANSCLUB";

  const recentmatch = data?.matches.recent;

  if (isLoading) return "Ca charge ";

  if (HasNoClub) {
    return <NoClub></NoClub>;
  }  

  return <>  <div>
        <ResultLastFiveMatches
          Role={data!.role}
          recentmatch={recentmatch}
        ></ResultLastFiveMatches>
      </div></>
}

export default ComposantPrincipalAccueil;
