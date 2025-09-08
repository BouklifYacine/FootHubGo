"use client";
import React from "react";
import { UseDataAccueil } from "../hooks/UseDataAccueil";
import NoClub from "./NoClub";
import ResultLastFiveMatches from "./ResultLastFiveMatches";

function ComposantPrincipalAccueil() {;

  const { data, isLoading } = UseDataAccueil();

  const Coach = data?.role === "ENTRAINEUR"
  const Player = data?.role === "JOUEUR";
  const HasNoClub = data?.role === "SANSCLUB";

const recentmatch = data?.matches.recent

  if (HasNoClub) {
    return <NoClub></NoClub>;
  } else if (Coach) {
    return (  
      <div>
       <ResultLastFiveMatches Role={data.role} recentmatch={recentmatch}></ResultLastFiveMatches>
      </div>
    );
  } else {
    return <div>ComposantPrincipal</div>;
  }
}

export default ComposantPrincipalAccueil;
