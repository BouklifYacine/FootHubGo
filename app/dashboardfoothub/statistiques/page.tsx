import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockStatsJoueur from "@/features/stats/statsjoueur/components/teststats";
import React from "react";

async function StatistiquePage() {
  const user = await MiddlewareUtilisateurNonConnecte();

  console.log(user.user.id);
  return (
    <div className="">
      
      
      <BlockStatsJoueur></BlockStatsJoueur>
    </div>
  );
}

export default StatistiquePage;
