"use client";


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useClassementJoueurs } from "@/features/classementjoueurs/hooks/useClassementEquipe";
import { useClassementEquipe } from "../hooks/useClassementequipe";
import ClassementEquipe from "./ClassementEquipe";
import ClassementJoueur from "@/features/classementjoueurs/components/ClassementJoueur";


export default function Classement() {
  const { data, isLoading, error } = useClassementJoueurs();
 const {data : statsequipes, isLoading : chargementEquipe, error : erreurequipes} = useClassementEquipe()
  const [sectionjoueur , useSectionJoueur] = useState(false)

  const AfficherSectionJoueur = () => {
    useSectionJoueur(!sectionjoueur)
  }

  return (
    <div className="space-y-6">
      <Button onClick={AfficherSectionJoueur}>{!sectionjoueur ? "Stats Equipes" : "Stats Joueur"}</Button>
      {!sectionjoueur ? 
      
      <ClassementJoueur data={data} isLoading={isLoading} error={error}/> :(
        <ClassementEquipe data={statsequipes} isLoading={chargementEquipe} erreurequipes={erreurequipes} />
)}
    </div>
  );
}
