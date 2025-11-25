import React from "react";
import { BoutonAjouter } from "./BoutonAjouter";
import { RejoindreClubModal } from "./RejoindreClubModal";

function NoClub() {
  return (
    <div className="mx-8">
      <div className="flex items-center gap-4">
        <BoutonAjouter texte="Créer un club" />
        <RejoindreClubModal texte="Rejoindre un club" />
      </div>
    </div>
  );
}

export default NoClub;
