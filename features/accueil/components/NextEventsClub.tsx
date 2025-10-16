import React from "react";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Timer, CalendarX } from "lucide-react";
import LogoVS from "@/public/pngtree-fiery-vs-logo-battle-symbol-competition-icon-flame-clipart-png-image_15705733.png";
import Image from "next/image";
import LogoLiverpool from "@/public/Logo_FC_Liverpool.svg.png";

dayjs.locale("fr");

interface Props {
  data: ApiAccueil | undefined;
  TeamName: string | undefined;
}

function NextEventsClub({ data, TeamName }: Props) {
  const UpcomingEvents = data?.matches.upcoming;

  const UpcomingMatches = UpcomingEvents?.filter(
    (u) => u.typeEvenement === "CHAMPIONNAT" || u.typeEvenement === "COUPE"
  );

  const FirstUpcomingMatch = UpcomingMatches ? UpcomingMatches[0] : undefined;

  const ColorBadgeEvent = (event: string) => {
    if (event === "CHAMPIONNAT") return "bg-blue-400 text-white";
    else if (event === "COUPE") return "bg-purple-400 text-white";
    return "";
  };

  // Cas où il n'y a pas de prochain match
  if (!FirstUpcomingMatch) {
    return (
      <div className="flex items-center justify-center w-full h-full py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <CalendarX size={48} className="text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucun match programmé
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Le prochain match s'affichera ici une fois planifié
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl rounded-3xl p-4">
      <div className="flex justify-between ">
        <p className="text-sm md:text-xl font-medium tracking-tighter">
          Prochain Match
        </p>
        <p className="text-sm md:text-xl font-medium tracking-tighter flex items-center gap-1.5">
          {FirstUpcomingMatch.lieu} <MapPin size={21} />
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2.5 ">
        <p className="flex items-center text-md gap-1 md:text-lg text-xs ">
          <Calendar size={18} />
          {dayjs(FirstUpcomingMatch.dateDebut).format("DD/MM/YYYY")}
        </p>
        <p>|</p>
        <p className="flex items-center text-md gap-1 md:text-lg text-xs">
          <Timer size={18} />
          {dayjs(FirstUpcomingMatch.dateDebut).format("H")}
          {"h"}
          {dayjs(FirstUpcomingMatch.dateDebut).format("mm")}
        </p>
      </div>

      <div className="flex justify-center items-center gap-12 mt-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={LogoLiverpool}
            alt="logo équipe"
            className="w-[70px] h-[90px] md:w-[100px] md:h-[120px]"
          />
          <p className="font-medium text-sm md:text-xl tracking-tighter">
            {TeamName}
          </p>
        </div>

        <Image
          src={LogoVS}
          alt="logo vs"
          className="w-[45px] h-[55px] md:w-[90px] md:h-[90px]"
        />

        <div className="flex flex-col items-center gap-2">
          <Image
            src={LogoLiverpool}
            alt="logo adversaire"
            className="w-[70px] h-[90px] md:w-[100px] md:h-[120px]"
          />
          <p className="font-medium text-sm md:text-xl tracking-tighter">
            {FirstUpcomingMatch.adversaire}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 mb-4">
        <Badge
          className={`${ColorBadgeEvent(
            FirstUpcomingMatch.typeEvenement || ""
          )} text-xs md:text-sm rounded-full tracking-tighter font-medium`}
        >
          <p>{FirstUpcomingMatch.typeEvenement}</p>
        </Badge>
      </div>
    </div>
  );
}

export default NextEventsClub;
