import React from "react";
import { BoutonAjouter } from "./BoutonAjouter";
import { RejoindreClubModal } from "./RejoindreClubModal";

import { useGetAllClub } from "@/features/club/hooks/useGetAllClub";
import { ClubTable } from "./ClubTable";

function NoClub() {
  const { data: clubs, isLoading, isError } = useGetAllClub();

  return (
    <div className="mx-8 space-y-8">
      <div className="flex items-center gap-4">
        <BoutonAjouter texte="Créer un club" />
        <RejoindreClubModal texte="Rejoindre un club" />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Liste des clubs</h2>
        {isLoading ? (
          <div className="text-center py-4">Chargement des clubs...</div>
        ) : isError ? (
          <div className="text-center py-4 text-red-500">
            Erreur lors du chargement des clubs.
          </div>
        ) : (
          <ClubTable clubs={clubs || []} />
        )}
      </div>
    </div>
  );
}

export default NoClub;
