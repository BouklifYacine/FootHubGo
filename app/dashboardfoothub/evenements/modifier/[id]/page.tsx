"use client";
import { useParams } from "next/navigation";

export default function FormulaireModifierEvenement() {
  const params = useParams();
  const id = params.id; // Récupère l'ID depuis l'URL

  return (
    <div>
      <h1>Modification de l'événement {id}</h1>
      {/* Votre formulaire de modification ici */}
    </div>
  );
}