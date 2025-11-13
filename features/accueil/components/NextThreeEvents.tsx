import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Image from "next/image";
import { Calendar, MapPin, Timer, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";
import LogoCity from "@/public/Logo_Manchester_City_2016.svg";
import { ColorBadgeEvent } from "@/lib/ColorBadgeEvent";

dayjs.locale("fr");

interface Props {
  data: ApiAccueil | undefined;
}

function NextThreeEvents({ data }: Props) {
  const upcomingMatches = data?.matches.upcoming || [];

  if (upcomingMatches.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-8 lg:py-12">
        <div className="flex flex-col items-center gap-3 lg:gap-4 text-center px-4">
          <CalendarX className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 dark:text-gray-600" />
          <p className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucun match à venir
          </p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
            Les prochains matchs s&apos;afficheront ici une fois programmés
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <h3 className="text-base lg:text-lg font-medium tracking-tight">
          Prochains matchs
        </h3>
      </div>

      {/* Container des cartes - Flexbox avec wrap */}
      <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
        {upcomingMatches.slice(0, 3).map((m) => (
          <div
            key={m.id}
            className="flex flex-col w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] min-w-0 border border-gray-200/60 dark:border-gray-700/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            {/* Badge + Lieu */}
            <div className="flex justify-between items-center mb-4 gap-2">
              <Badge
                className={`${ColorBadgeEvent(
                  m.typeEvenement || ""
                )} text-xs px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full tracking-tight font-semibold`}
              >
                {m.typeEvenement}
              </Badge>
              
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs lg:text-sm tracking-tight font-medium truncate">
                  {m.lieu}
                </p>
              </div>
            </div>

            {/* Date + Heure */}
            <div className="flex items-center justify-center gap-3 lg:gap-4 mb-4 lg:mb-5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <p className="text-xs lg:text-sm font-medium">
                  {dayjs(m.dateDebut).format("DD/MM/YYYY")}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                <p className="text-xs lg:text-sm font-medium">
                  {dayjs(m.dateDebut).format("HH:mm")}
                </p>
              </div>
            </div>

            {/* Logo + Adversaire */}
            <div className="flex flex-col items-center gap-3 lg:gap-4 mt-auto">
              <div className="relative w-16 h-16 lg:w-18 lg:h-18">
                <Image
                  src={LogoCity}
                  fill
                  alt={`Logo ${m.adversaire}`}
                  className="object-contain"
                />
              </div>
              
              <p className="text-sm lg:text-base font-bold tracking-tight text-center line-clamp-2">
                {m.adversaire}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NextThreeEvents;
