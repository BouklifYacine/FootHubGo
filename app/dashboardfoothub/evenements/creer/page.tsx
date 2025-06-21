import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import FormulaireCreerEvenement from "@/features/evenements/components/FormulaireCreerEvenement";
import React from "react";

async function CreerEvenement() {
  await MiddlewareUtilisateurNonConnecte();

  return (
    <>
      <FormulaireCreerEvenement />
    </>
  );
}

export default CreerEvenement;