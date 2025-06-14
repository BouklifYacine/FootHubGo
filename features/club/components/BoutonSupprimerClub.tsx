"use client";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import React from "react";
import { useSupprimerClub } from "../hooks/useSupprimerClub";
import AlerteDIalogueIcone from "@/components/AlertDialog/AlerteDialogueIcone";

interface Props {
  equipeid: string;
}

function BoutonSupprimerClub({ equipeid }: Props) {
  const { mutate, isPending } = useSupprimerClub();

  const supprimerClub = () => {
    mutate(equipeid);
  };
  return (
    <>
      <AlerteDIalogueIcone
        Titre="Voulez vous supprimer votre club?"
        description="En cliquant sur confirmez vous allez supprimer votre club et toute ses données lié a ce club. Aucune récupération des informations ne sera possible."
        supprimer={supprimerClub}
        disabled={isPending}
      ></AlerteDIalogueIcone>
    </>
  );
}

export default BoutonSupprimerClub;
