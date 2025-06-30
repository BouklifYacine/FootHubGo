"use client";
import { $Enums, StatistiqueEquipe } from "@prisma/client";
import React from "react";
import City from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AlarmClock, Calendar, CalendarDays, House } from "lucide-react";
import dayjs from "dayjs";
import { BoutonCreerStatsEquipe } from "./BoutonCreerStatsEquipe";

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

function CardEvenementID({ infosmatch }: Props) {
  return (
    <div>
      <div className="mb-2">
        <BoutonCreerStatsEquipe />
      </div>

      <div className="flex flex-col md:flex-row md:justify-around gap-4">

        <div className="border border-blue-500 rounded-2xl p-4 w-full md:w-1/2 lg:w-1/3 h-full">
          <div className="flex flex-col gap-2 items-center justify-center">
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
                    <House
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />{" "}
                    {infosmatch.lieu}
                  </p>
                  <p className="flex items-center text-[10px] md:text-sm gap-1">
                    <AlarmClock
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />{" "}
                    Début :{" "}
                    {dayjs(infosmatch.date?.toString()).format("H")}
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
              <span className="truncate text-[10px] md:text-lg font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.nomequipe}
              </span>
            </div>
            {/* Score */}
            <div className="flex items-center flex-shrink-0">
              <span className="text-base md:text-3xl font-bold text-center mx-1 min-w-[20px]">
                {infosmatch.score?.butsMarques ?? "-"}
              </span>
              <span className="text-base md:text-2xl font-bold mx-1">-</span>
              <span className="text-base md:text-3xl font-bold text-center mx-1 min-w-[20px]">
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
              <span className="truncate text-[10px] md:text-lg font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.adversaire}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Calendar
              size={14}
              className="md:w-5 md:h-5 w-3.5 h-3.5"
            />
            <p className="text-[10px] md:text-base">
              {dayjs(infosmatch.date?.toString()).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>

        <div className="border border-blue-500 rounded-2xl p-4 w-full md:w-1/2 lg:w-1/3 h-full">
          <div className="flex flex-col gap-2 items-center justify-center">
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
                    <House
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />{" "}
                    {infosmatch.lieu}
                  </p>
                  <p className="flex items-center text-[10px] md:text-sm gap-1">
                    <AlarmClock
                      size={14}
                      className="md:w-5 md:h-5 w-3.5 h-3.5"
                    />{" "}
                    Début :{" "}
                    {dayjs(infosmatch.date?.toString()).format("H")}
                    {"h"}
                    {dayjs(infosmatch.date?.toString()).format("mm")}
                  </p>
                </div>
              </Badge>
            )}
          </div>
          {/* Ligne score alignée et responsive */}
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
              <span className="truncate text-[10px] md:text-lg font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.nomequipe}
              </span>
            </div>
            {/* Score */}
            <div className="flex items-center flex-shrink-0">
              <span className="text-base md:text-3xl font-bold text-center mx-1 min-w-[20px]">
                {infosmatch.score?.butsMarques ?? "-"}
              </span>
              <span className="text-base md:text-2xl font-bold mx-1">-</span>
              <span className="text-base md:text-3xl font-bold text-center mx-1 min-w-[20px]">
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
              <span className="truncate text-[10px] md:text-lg font-bold text-center md:mt-2 md:mb-0">
                {infosmatch.adversaire}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Calendar
              size={14}
              className="md:w-5 md:h-5 w-3.5 h-3.5"
            />
            <p className="text-[15px] md:text-base">
              {dayjs(infosmatch.date?.toString()).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardEvenementID;