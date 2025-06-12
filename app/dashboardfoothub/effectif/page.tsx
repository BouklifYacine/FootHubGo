import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import BlockEffectif from "@/features/club/components/BlockEffectif";
import React from "react";

async function Effectif() {
  await MiddlewareUtilisateurNonConnecte();

  return (
    <>
      <BlockEffectif></BlockEffectif>
    </>
  );
}

export default Effectif;
