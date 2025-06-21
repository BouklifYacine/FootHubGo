import React from "react";


import CardEvenement from "./CardEvenement";
import { BoutonCreerEvenement } from "./BoutonCreerEvenement";

function ListeEvenement() {
  return (
    <div>
      <BoutonCreerEvenement></BoutonCreerEvenement>
      <div className="flex gap-7 flex-wrap items-center ">
        <CardEvenement></CardEvenement>
      </div>
    </div>
  );
}

export default ListeEvenement;
