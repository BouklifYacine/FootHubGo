"use client";
import React, { useState } from "react";
import { Presence, StatsJoueur } from "../../types/TypesEvenements";
import { Button } from "@/components/ui/button";
import ArrayPlayerStatsEventsId from "@/features/stats/statsequipe/components/ArrayPlayerStatsEventsId";
import ArrayPlayerStatusEventId from "@/features/stats/statsequipe/components/ArrayPlayerStatusEventId";
import { useSupprimerStatsEquipe } from "@/features/stats/statsequipe/hooks/useSupprimerStatsEquipe";
import toast from "react-hot-toast";

interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  presences: Presence[] | undefined;
  IdStatsandEvent: {
    idstatsequipe: string | undefined;
    eventid: string;
  };
}

function TableauStatsJoueurEvenement({
  statsJoueur,
  presences,
  IdStatsandEvent,
}: Props) {
  const [affichage, setAffichage] = useState(false);

  const GererAffichage = () => {
    setAffichage(!affichage);
  };

  const { eventid, idstatsequipe } = IdStatsandEvent;
  const { mutate, isPending } = useSupprimerStatsEquipe();

  const DeleteStatsTeamOnClick = () => {
    if (!eventid) {
      toast.error("ID d'événement manquant");
      return;
    }
    mutate({ eventId: eventid, statsEquipeId: idstatsequipe! });
  };

  console.log("id composant eventid " + eventid);
    console.log("id composant statsid " + idstatsequipe);

  return (
    <div className="overflow-x-auto mt-10">
      <div className="flex gap-2">
        <Button onClick={GererAffichage} className="mb-4">
          {" "}
          {affichage ? "Tableau Stats" : "Tableau présence"}{" "}
        </Button>

        {idstatsequipe && (
          <Button
            onClick={DeleteStatsTeamOnClick}
            className="mb-4"
            disabled={isPending}
          >
            {" "}
            {"Supprimer Stats"}{" "}
          </Button>
        )}
      </div>

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
