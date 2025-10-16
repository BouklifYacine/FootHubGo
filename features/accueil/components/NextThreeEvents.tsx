import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Image from "next/image";
import { Calendar, MapPin, Timer, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";
import LogoCity from "@/public/Logo_Manchester_City_2016.svg";

dayjs.locale("fr");

interface Props {
  data: ApiAccueil | undefined;
}

function NextThreeEvents({ data }: Props) {
  const upcomingMatches = data?.matches.upcoming?.slice(0, 3) || [];

  const ColorBadgeEvent = (event: string) => {
    if (event === "CHAMPIONNAT")
      return "bg-blue-500 hover:bg-blue-600 text-white";
    else if (event === "COUPE")
      return "bg-purple-500 hover:bg-purple-600 text-white";
    return "bg-gray-500 hover:bg-gray-600 text-white";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Titre */}
      <div className="mb-6">
        <p className="text-lg md:text-xl font-medium tracking-tighter">
          Prochains matchs
        </p>
      </div>

      {/* Cas où il n'y a pas de matchs à venir */}
      {upcomingMatches.length === 0 ? (
        <div className="flex items-center justify-center w-full py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <CalendarX size={48} className="text-gray-400 dark:text-gray-600" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              Aucun match à venir
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Les prochains matchs s'afficheront ici une fois programmés
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-center gap-6 w-full">
          {upcomingMatches.map((m) => (
            <div
              key={m.id}
              className="relative group border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6 w-full md:min-w-[280px] md:max-w-[320px] hover:shadow-2xl hover:shadow-gray-300/50 dark:hover:shadow-black/50 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Badge et Lieu */}
              <div className="flex justify-between items-center mb-5">
                <Badge
                  className={`${ColorBadgeEvent(
                    m.typeEvenement || ""
                  )} text-xs px-3 py-1 rounded-full tracking-tight font-semibold shadow-md transition-all duration-200`}
                >
                  {m.typeEvenement}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <MapPin size={18} />
                  <p className="text-sm tracking-tight font-semibold">{m.lieu}</p>
                </div>
              </div>

              {/* Date et Heure */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <p className="text-sm font-semibold">
                    {dayjs(m.dateDebut).format("DD/MM/YYYY")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={16} />
                  <p className="text-sm font-semibold">
                    {dayjs(m.dateDebut).format("HH:mm")}
                  </p>
                </div>
              </div>

              {/* Logo et Adversaire */}
              <div className="flex flex-col items-center gap-4 mt-5">
                <Image
                  src={LogoCity}
                  width={85}
                  height={85}
                  alt="Logo Équipe"
                  className="object-contain"
                />
                <p className="text-base font-bold tracking-tight text-center">
                  {m.adversaire}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NextThreeEvents;
