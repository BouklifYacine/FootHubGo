"use client";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import React from "react";
import { useSupprimerClub } from "../hooks/useSupprimerClub";

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
      <BoutonSupprimer
        supprimer={supprimerClub}
        disabled={isPending}
      ></BoutonSupprimer>
    </>
  );
}

export default BoutonSupprimerClub;
