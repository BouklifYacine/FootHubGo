import React from "react";

import BoutonCreerEvenement from "./BoutonCreerEvenement";
import CardEvenement from "./CardEvenement";

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
