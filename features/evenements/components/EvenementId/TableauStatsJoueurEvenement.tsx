"use client";
import React, { useState } from "react";
import { Presence, StatsJoueur } from "../../types/TypesEvenements";
import { Button } from "@/components/ui/button";
import ArrayPlayerStatsEventsId from "@/features/stats/statsequipe/components/ArrayPlayerStatsEventsId";
import ArrayPlayerStatusEventId from "@/features/CallUp/components/ArrayPlayerStatusEventId";
interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  IdStatsandEvent: {
    idstatsequipe: string | undefined;
    eventid: string;
  };
}

function TableauStatsJoueurEvenement({
  statsJoueur,
  IdStatsandEvent,
}: Props) {
  const [affichage, setAffichage] = useState(false);

  const GererAffichage = () => {
    setAffichage(!affichage);
  };

  return (
    <div className="overflow-x-auto mt-10">
      <div className="flex gap-2">
        <Button onClick={GererAffichage} className="mb-4">
          {" "}
          {affichage && statsJoueur ? "Tableau Stats" : "Tableau présence"}{" "}
        </Button>
      </div>

      {affichage ? (
        <ArrayPlayerStatsEventsId
          eventId={IdStatsandEvent.eventid}
          statsJoueur={statsJoueur}
        ></ArrayPlayerStatsEventsId>
      ) : (
        <ArrayPlayerStatusEventId
          statsteamid={IdStatsandEvent}
        ></ArrayPlayerStatusEventId>
      )}
    </div>
  );
}

export default TableauStatsJoueurEvenement;
