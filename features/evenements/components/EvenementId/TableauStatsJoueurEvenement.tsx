"use client";

import React, { useState } from "react";
import { StatsJoueur } from "../../types/TypesEvenements";
import ArrayPlayerStatsEventsId from "@/features/stats/statsequipe/components/ArrayPlayerStatsEventsId";
import ArrayPlayerStatusEventId from "@/features/CallUp/components/ArrayPlayerStatusEventId";
import { ToggleViewButton } from "./ToggleViewButton";

interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  IdStatsandEvent: {
    idstatsequipe: string | undefined;
    eventid: string;
    dateEvent : Date | undefined
  };
}

function TableauStatsJoueurEvenement({
  statsJoueur,
  IdStatsandEvent,
}: Props) {
  const [view, setView] = useState<"players" | "stats">("players");

  return (
    <div className="overflow-x-auto mt-10">
      <div className="flex gap-2 mb-4">
        <ToggleViewButton
          value={view}
          onValueChange={setView}
          leftLabel="Joueurs"
          rightLabel="Statistiques"
        />
      </div>

      {view === "stats" ? (
        <ArrayPlayerStatsEventsId
          eventId={IdStatsandEvent.eventid}
          statsJoueur={statsJoueur}
        />
      ) : (
        <ArrayPlayerStatusEventId statsteamid={IdStatsandEvent} statsJoueur={statsJoueur} />
      )}
    </div>
  );
}

export default TableauStatsJoueurEvenement;
