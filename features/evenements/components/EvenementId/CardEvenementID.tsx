"use client";
import { $Enums, StatistiqueEquipe } from "@prisma/client";
import React from "react";
import City from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AlarmClock, Calendar, CalendarDays, House } from "lucide-react";
import dayjs from "dayjs";
import { BoutonCreerStatsEquipe } from "@/features/stats/statsequipe/components/BoutonCreerStatsEquipe";
import { useSupprimerStatsEquipe } from "@/features/stats/statsequipe/hooks/useSupprimerStatsEquipe";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { BoutonModifierStatsEquipe } from "@/features/stats/statsequipe/components/BoutonModifierStatsEquipe";

interface Props {
  infosmatch: {
    date: Date | undefined;
    lieu: string | null | undefined;
    adversaire: string | null | undefined;
    typeEvenement: $Enums.TypeEvenement | undefined;
    titre: string | undefined;
    score: StatistiqueEquipe | null | undefined;
    nomequipe: string | undefined;
  };

  IdStatsandEvent: {
    idstatsequipe: string | undefined;
    eventid: string;
  };
}

const BadgeResultat = (resultat: $Enums.ResultatMatch | null | undefined) => {
  if (resultat === "VICTOIRE") {
    return "bg-green-500";
  } else if (resultat === "DEFAITE") {
    return "bg-red-500";
  } else {
    return "bg-gray-500";
  }
};

function CardEvenementID({ infosmatch, IdStatsandEvent }: Props) {
  const { mutate, isPending } = useSupprimerStatsEquipe();
  const { data, isLoading } = useInfosClub();

  const entraineur = data?.role === "ENTRAINEUR";

  const DeleteStatsTeamOnClick = () => {
    if (!IdStatsandEvent.eventid) {
      toast.error("ID d'événement manquant");
      return;
    }
    mutate({
      eventId: IdStatsandEvent.eventid,
      statsEquipeId: IdStatsandEvent.idstatsequipe!,
    });
  };
  
const now = dayjs();
const matchDate = dayjs(infosmatch.date);
const threeHoursAfterMatch = matchDate.add(3, "hours");

const canCreateStats = now.isAfter(threeHoursAfterMatch);


  return (
    <div>
   {entraineur && (
  <div className="mb-2 flex gap-2">
    {IdStatsandEvent.idstatsequipe ? (
      <>
        <BoutonModifierStatsEquipe
          eventid={IdStatsandEvent.eventid}
          statsEquipe={infosmatch.score!}
        />
        <Button onClick={DeleteStatsTeamOnClick} disabled={isPending} className="bg-red-500 text-white cursor-pointer hover:bg-red-600">
          Supprimer Stats
        </Button>
      </>
    ) : canCreateStats ? (
      <BoutonCreerStatsEquipe eventid={IdStatsandEvent.eventid} />
    ) : (
     ""
    )}
  </div>
)}


      <div className="flex items-center justify-center">
        <div className="border border-blue-500 rounded-2xl p-6 md:p-10 w-full md:w-3/4 lg:w-2/3 max-w-3xl h-full ">
          <div className="flex flex-col gap-2 items-center justify-center ">
            {infosmatch.score ? (
              <Badge
                className={`text-xs md:text-xl font-bold tracking-tighter rounded-xl ${BadgeResultat(
                  infosmatch.score?.resultatMatch
                )}`}
              >
                {infosmatch.score?.resultatMatch}
              </Badge>
            ) : (
              <Badge className="text-xs md:text-xl font-bold tracking-tighter rounded-xl bg-gray-500">
                <div className="flex items-center gap-2">
                  <p className="flex items-center text-[10px] md:text-sm gap-1">
                    <CalendarDays
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />
                    {dayjs(infosmatch.date?.toString()).format("DD/MM/YYYY")}
                  </p>
                  <p className="flex items-center text-[10px] md:text-sm gap-1">
                    <House size={14} className="md:w-5 md:h-5 w-3.5 h-3.5" />{" "}
                    {infosmatch.lieu}
                  </p>
                  <p className="flex items-center text-[10px] md:text-sm gap-1">
                    <AlarmClock
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />{" "}
                    Début : {dayjs(infosmatch.date?.toString()).format("H")}
                    {"h"}
                    {dayjs(infosmatch.date?.toString()).format("mm")}
                  </p>
                </div>
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between w-full mt-4 gap-2 flex-wrap">
            {/* Équipe 1 */}
            <div className="flex flex-col items-center flex-1 min-w-[0]">
              <div className="w-8 h-8 md:w-16 md:h-16 mb-1 md:mb-0 relative">
                <Image
                  src={City}
                  fill
                  alt="logo équipe"
                  className="object-contain"
                  sizes="(max-width: 768px) 32px, 64px"
                />
              </div>
              <span className="md:text-3xl font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.nomequipe}
              </span>
            </div>
            {/* Score */}
            <div className="flex items-center">
              <span className="text-base md:text-5xl font-bold text-center mx-1 min-w-[20px]">
                {infosmatch.score?.butsMarques ?? "-"}
              </span>
              <span className="text-base md:text-2xl font-bold mx-1">-</span>
              <span className="text-base md:text-5xl font-bold text-center mx-1 min-w-[20px]">
                {infosmatch.score?.butsEncaisses ?? "-"}
              </span>
            </div>
            {/* Équipe 2 */}
            <div className="flex flex-col items-center flex-1 min-w-[0]">
              <div className="w-8 h-8 md:w-16 md:h-16 mb-1 md:mb-0 relative">
                <Image
                  src={City}
                  fill
                  alt="logo adversaire"
                  className="object-contain"
                  sizes="(max-width: 768px) 32px, 64px"
                />
              </div>
              <span className="md:text-3xl font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.adversaire}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Calendar size={14} className="md:w-5 md:h-5 w-3.5 h-3.5" />
            <p className="text-[10px] md:text-base">
              {dayjs(infosmatch.date?.toString()).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardEvenementID;
