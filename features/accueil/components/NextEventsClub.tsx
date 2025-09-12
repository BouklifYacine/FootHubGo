import React from "react";
import { ApiAccueil } from "../interfaces/InterfaceApiAccueil";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Badge } from "@/components/ui/badge";
import { Calendar, House, Timer } from "lucide-react";
import LogoVS from "@/public/pngtree-fiery-vs-logo-battle-symbol-competition-icon-flame-clipart-png-image_15705733.png"
import Image from "next/image";
import LogoLiverpool from "@/public/Logo_FC_Liverpool.svg.png"

dayjs.locale("fr");

interface Props {
  data: ApiAccueil | undefined;
  TeamName: string | undefined
}

function NextEventsClub({ data, TeamName }: Props) {
  const UpcomingEvents = data?.matches.upcoming;

  const UpcomingMatches = UpcomingEvents?.filter(
    (u) => u.typeEvenement === "CHAMPIONNAT" || u.typeEvenement === "COUPE"
  );

  const FirstUpcomingMatch = UpcomingMatches ? UpcomingMatches[0] : undefined;

  console.log(FirstUpcomingMatch?.adversaire);

  return (
    <div className="border-2 border-gray-200 max-w-3xl rounded-3xl p-4">
      <div className="flex justify-between ">
        <p className="text-sm md:text-xl font-medium tracking-tighter">Prochain Match</p>
      </div>

      <div className="flex items-center justify-center ">
        <Badge className="flex gap-2 rounded-3xl p-2 px-4 ">
          {" "}
          <p className="flex items-center text-lg font-light gap-1">
            <Calendar size={24} className="font-light" />
            {dayjs(FirstUpcomingMatch?.dateDebut).format("DD/MM/YYYY")}
          </p>
          <p className="flex items-center text-lg font-light gap-1">
            <Timer size={24} />
            {dayjs(FirstUpcomingMatch?.dateDebut).format("H")}
            {"h"}
            {dayjs(FirstUpcomingMatch?.dateDebut).format("mm")}
          </p>
          <p className="flex items-center text-lg font-light gap-1">
            <House size={24} />
            {FirstUpcomingMatch?.lieu}
          </p>
        </Badge>
      </div>

      <div className="flex justify-center items-center gap-12 mt-6">
        <div className="flex flex-col items-center gap-2">
      <Image src={LogoLiverpool} alt="logo vs" width={90} height={90}></Image>
          <p className="font-medium text-xl tracking-tighter">{TeamName}</p>
         </div>

         <Image src={LogoVS} alt="logo vs" width={75} height={75}></Image>

       <div className="flex flex-col items-center gap-2">
      <Image src={LogoLiverpool} alt="logo vs" width={90} height={90}></Image>
          <p className="font-medium text-xl tracking-tighter">{FirstUpcomingMatch?.adversaire}</p>
         </div>
      </div>
    </div>
  );
}

export default NextEventsClub;
