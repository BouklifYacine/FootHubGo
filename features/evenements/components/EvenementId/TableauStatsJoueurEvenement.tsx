"use client";
import React, { useState } from "react";
import { Presence, StatsJoueur } from "../../types/TypesEvenements";
import { Button } from "@/components/ui/button";
import ArrayPlayerStatsEventsId from "@/features/stats/statsequipe/components/ArrayPlayerStatsEventsId";
import ArrayPlayerStatusEventId from "@/features/stats/statsequipe/components/ArrayPlayerStatusEventId";

interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  presences: Presence[] | undefined;
}

function TableauStatsJoueurEvenement({ statsJoueur, presences }: Props) {
  const [affichage, setAffichage] = useState(false);

  const GererAffichage = () => {
    setAffichage(!affichage);
  };

  return (
    <div className="overflow-x-auto mt-10">
      <Button onClick={GererAffichage} className="mb-4">
        {" "}
        {affichage ? "Tableau Stats" : "Tableau présence"}{" "}
      </Button>

      {affichage ? (
        <ArrayPlayerStatsEventsId
          statsJoueur={statsJoueur}
        ></ArrayPlayerStatsEventsId>
      ) : (
        <ArrayPlayerStatusEventId
          presences={presences}
        ></ArrayPlayerStatusEventId>
      )}
    </div>
  );
}

export default TableauStatsJoueurEvenement;
