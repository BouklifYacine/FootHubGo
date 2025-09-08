import React from "react";
import { BoutonAjouter } from "./BoutonAjouter";
import { InputBouton } from "./InputBouton";

function NoClub() {
  return (
    <div className="mx-8">
      <div className="flex gap-8 flex-wrap justify-between items-center">
        <BoutonAjouter texte="Créer un club"></BoutonAjouter>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-5">
          <InputBouton texte="Rejoindre un club" placeholder="123456" />
        </div>
      </div>
    </div>
  );
}

export default NoClub;
