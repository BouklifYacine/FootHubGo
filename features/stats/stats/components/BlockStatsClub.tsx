"use client";

import React from "react";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import BlockStatsJoueur from "../../statsjoueur/components/BlockStatsJoueur";
import BlockStatsEquipe from "../../statsequipe/components/BlockStatsEquipe";
import SkeletonBlockStats from "../../statsjoueur/components/SkeletonBlockStatsJoueur";

function BlockStatsClub() {
  const { data: dataclub, isLoading: InfosClubLoading } = useInfosClub();
  const idEquipe = dataclub?.equipe?.id;
  const role = dataclub?.role;

  if (InfosClubLoading) return <SkeletonBlockStats />;

  if (role === "JOUEUR") {
    return <BlockStatsJoueur />;
  }

  if (!idEquipe)
    return (
      <p className="text-center text-4xl">
        Aucune équipe trouvée pour ce club
      </p>
    );

  return <BlockStatsEquipe idEquipe={idEquipe} />;
}

export default BlockStatsClub;