import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockStatsClub from "@/features/stats/stats/components/BlockStatsClub";
import React from "react";

async function StatistiquePage() {
  const user = await MiddlewareUtilisateurNonConnecte();

  console.log(user.user.id);
  return (
    <div className="">
      
      
      <BlockStatsClub></BlockStatsClub>
    </div>
  );
}

export default StatistiquePage;
