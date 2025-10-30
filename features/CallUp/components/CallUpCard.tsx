"use client";

import { BadgeTexteIcone } from "@/components/Badge/BadgeTexteIcone";
import { Button } from "@/components/ui/button";
import Liverpool from "@/public/action-de-footballeur-sur-le-stade.jpg";
import {
  Calendar,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  UsersRound,
} from "lucide-react";
import { useGetCallUp } from "../hooks/UseGetCallUp";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

function CallUpCard() {
  const { data, isPending } = useGetCallUp();

  if (isPending) return <p>Chargement...</p>;

  if (!data || !data.convocations || data.convocations.length === 0) {
    return <p>Aucune convocation disponible</p>;
  }

  console.log(data.convocations)
  return (
    <>
      {data.convocations.map((convocation) => {
        const date = dayjs(convocation.evenement.dateDebut).format("dddd D MMMM");
        const heure = dayjs(convocation.evenement.dateDebut).format("HH:mm");

        return (
          <div key={convocation.id} className="bg-white rounded-xl w-[425px] mt-4">
            <div
              className="rounded-t-lg"
              style={{
                backgroundImage: `url(${Liverpool.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex justify-end p-2">
                <BadgeTexteIcone
                  texte={convocation.evenement.typeEvenement}
                  classname="tracking-tighter"
                />
              </div>

              <div className="flex p-2">
                <p className="text-2xl tracking-tighter text-white font-bold">
                  {convocation.evenement.titre}
                </p>
              </div>
            </div>

            <div className="p-2 mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">{date}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <UsersRound className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">
                  {convocation.evenement.adversaire}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-black">{heure}</p>
              </div>

              {convocation.evenement.lieu && (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-black">{convocation.evenement.lieu}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 p-4">
              <Button className="w-47 bg-red-500 text-white tracking-tight font-bold cursor-pointer">
                <CircleX /> Refuser
              </Button>
              <Button className="w-47 bg-green-500 text-white tracking-tight font-bold cursor-pointer">
                <CircleCheck /> Accepter
              </Button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default CallUpCard;
