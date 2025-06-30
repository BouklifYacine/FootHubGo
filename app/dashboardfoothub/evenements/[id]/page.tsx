"use client";

import CardEvenementID from "@/features/evenements/components/EvenementId/CardEvenementID";
import { useGetEvenementStatistiqueUnique } from "@/features/evenements/hooks/useGetEvenementUnique";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EvenementIdPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: evenement, isLoading, error } = useGetEvenementStatistiqueUnique(id);
  const infosmatch = {
    date : evenement?.dateDebut, 
    lieu : evenement?.lieu,
    adversaire : evenement?.adversaire, 
    typeEvenement : evenement?.typeEvenement, 
    titre : evenement?.titre,
    score : evenement?.statsEquipe,
    nomequipe : evenement?.nomEquipe
  }



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error || !evenement) {
    return (
      <div className="text-center p-10">
        <h1 className="text-xl font-bold">Erreur</h1>
        <p>L&apos;événement demandé n&apos;a pas pu être trouvé.</p>
      </div>
    );
  }

  return <>
  <CardEvenementID infosmatch={infosmatch}/>
  </>;
}
