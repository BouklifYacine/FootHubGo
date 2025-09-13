import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import LogoLiverpool from "@/public/github-icon-2.svg"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { $Enums } from "@prisma/client";
import { RecentMatch } from "../interfaces/InterfaceApiAccueil";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

dayjs.locale("fr");

interface Props {
  Role: $Enums.RoleEquipe;
  recentmatch: RecentMatch[] | undefined;
}

function ResultLastFiveMatches({ Role, recentmatch }: Props) {
  const IsAPlayer = Role === "JOUEUR";

  const rating = recentmatch
    ?.map((r) => r.statsJoueur?.[0].note)
    .filter((note) => note != null);

  const averageRating =
    rating && rating.length > 0
      ? rating.reduce((sum, rating) => sum + rating, 0) / rating.length
      : 0;

  const GetRatingColor = (rating: number) => {
    if (rating >= 7.5) return "bg-emerald-400 hover:bg-emerald-600";
    else if (rating >= 6) return "bg-green-700 hover:bg-green-900";
    return "bg-red-500 hover:bg-red-700 ";
  };

  const getResultColor = (resultat: string) => {
    switch (resultat) {
      case "VICTOIRE":
        return "bg-emerald-400 hover:bg-emerald-600";
      case "DEFAITE":
        return "bg-red-500 hover:bg-red-700";
      case "NUL":
        return "bg-yellow-500 hover:bg-yellow-700";
      default:
        return "bg-gray-400 hover:bg-gray-600";
    }
  };

  const getResultLetter = (resultat: string) => {
    switch (resultat) {
      case "VICTOIRE":
        return "V";
      case "DEFAITE":
        return "D";
      case "NUL":
        return "N";
      default:
        return "?";
    }
  };

  const prepareMatchesData = () => {
    const matches = [...(recentmatch || [])];

    while (matches.length < 5) {
      matches.push({
        id: `placeholder-${matches.length}`,
        dateDebut: "?",
        lieu: null,
        typeEvenement: "CHAMPIONNAT",
        statEquipe: {
          resultatMatch: "?",
          adversaire: null,
          butsMarques: null,
          butsEncaisses: null,
        },
        statsJoueur: [{ note: null }],
      });
    }

    return matches;
  };

  return (

      <div>
      <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tighter">
          5 derniers matchs
        </h2>

        {IsAPlayer ? (
          <div className="flex justify-center items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tighter">
              Note Moyenne :
            </span>
            <Badge
              className={`${GetRatingColor(averageRating)} "text-sm md:text-lg rounded-2xl font-extralight tracking-tight"`}
            >
              {averageRating.toFixed(2)}
            </Badge>
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 mt-2 ">
        <div className="flex flex-wrap justify-center md:justify-evenly gap-2 sm:gap-3 lg:gap-4">
          {prepareMatchesData()?.map((match) => (
            <div
              key={match.id}
              className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]"
            >
              <div className="">
                <Image
                  alt="Logo Club"
                  src={LogoLiverpool}
              
                  className="w-18 h-18  md:w-[110px] md:h-[110px] rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                />
              </div>

              <p className="text-xs sm:text-sm lg:text-base font-medium text-center">
                {match.dateDebut === "?"
                  ? "?"
                  : dayjs(match.dateDebut).format("D MMM")}
              </p>

              <div className="flex items-center gap-1 sm:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      className={`${getResultColor(match.statEquipe.resultatMatch)} rounded-full w-10 h-10  md:w-14 md:h-14 flex items-center justify-center text-md md:text-xl font-bold `}
                    >
                      {getResultLetter(match.statEquipe.resultatMatch)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Résultat du match</p>
                  </TooltipContent>
                </Tooltip>

                {IsAPlayer && (
                  <>
                    <span className=" text-sm sm:text-lg lg:text-2xl opacity-60">
                      |
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`${GetRatingColor(match.statsJoueur?.[0]?.note || 0)} rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base`}
                        >
                          {match.statsJoueur?.[0]?.note || "?"}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Note du match</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    
  );
}

export default ResultLastFiveMatches;
