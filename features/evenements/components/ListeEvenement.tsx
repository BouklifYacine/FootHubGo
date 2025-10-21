"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardEvenement from "./CardEvenement";
import { BoutonCreerEvenement } from "./BoutonCreerEvenement";
import { useSupprimerEvenement } from "../hooks/useSupprimerEvenement";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useEvenements } from "../hooks/useEvenements";
import FiltersEventsByDate from "./FiltersEventsByDate";
import FiltersEventsByType from "./FilterEventByType";

function ListeEvenement() {
  const [filtreDate, setFiltreDate] = useState<"tous" | "avant" | "apres">("tous");
  const [filtreTypeEvent, setFiltreTypeEvent] = useState<string>("tous");
  const { data, isLoading } = useEvenements();
  const { data: infosdata, isLoading: isLoadingInfosClub } = useInfosClub();
  const { mutate, isPending } = useSupprimerEvenement();

  if (isLoading || isLoadingInfosClub) return <p>Ca charge gros bg</p>;

  const filteredEvents = data
    ? {
        ...data,
        evenements: data.evenements.filter((e) => {
          const eventDate = dayjs(e.dateDebut);

          const filtreDateMatch = (() => {
            if (filtreDate === "tous") {
              return true;
            }
            if (filtreDate === "avant") {
              return eventDate.isBefore(dayjs(), "day");
            }
            if (filtreDate === "apres") {
              return eventDate.isSame(dayjs(), "day") || eventDate.isAfter(dayjs(), "day");
            }
            return true;
          })();

          const filtreTypeMatch = filtreTypeEvent === "tous" ? true : e.typeEvenement === filtreTypeEvent;

          return filtreDateMatch && filtreTypeMatch;
        }),
      }
    : undefined;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <BoutonCreerEvenement />
        <FiltersEventsByDate onChangeFiltre={setFiltreDate} />
        <FiltersEventsByType onChangeFiltre={setFiltreTypeEvent}></FiltersEventsByType>
      </div>
      <div className="flex gap-7 flex-wrap items-center">
        <CardEvenement
          filteredEvents={filteredEvents}
          infosdata={infosdata}
          isPending={isPending}
          mutate={mutate}
        />
      </div>
    </div>
  );
}

export default ListeEvenement;
