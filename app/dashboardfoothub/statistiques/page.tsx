import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockStatsClub from "@/features/stats/stats/components/BlockStatsClub";
import ComponentsPageStats from "@/features/stats/statsequipe/components/ComponentsPageStats";
import FullStatsTeam from "@/features/stats/statsequipe/components/FullStatsTeam";
import React from "react";

async function StatistiquePage() {
  await MiddlewareUtilisateurNonConnecte();
  return (
    <div className="">
    <ComponentsPageStats></ComponentsPageStats>
    </div>
  );
}

export default StatistiquePage;
