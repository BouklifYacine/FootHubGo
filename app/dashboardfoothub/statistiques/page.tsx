import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import ComponentsPageStats from "@/features/stats/statsequipe/components/ComponentsPageStats";
import React from "react";

async function StatistiquePage() {
  await MiddlewareUtilisateurNonConnecte();
  return (
    <> <ComponentsPageStats></ComponentsPageStats></>
   
   
  );
}

export default StatistiquePage;
