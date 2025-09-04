import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockStatsClub from "@/features/stats/stats/components/BlockStatsClub";
import FullStatsTeam from "@/features/stats/statsequipe/components/FullStatsTeam";
import React from "react";

async function StatistiquePage() {
  const user = await MiddlewareUtilisateurNonConnecte();

  console.log(user.user.id);
  return (
    <div className="">
      <BlockStatsClub></BlockStatsClub>
      <FullStatsTeam></FullStatsTeam>
      
    </div>
  );
}

export default StatistiquePage;
