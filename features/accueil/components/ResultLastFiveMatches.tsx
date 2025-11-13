import React from "react";
import LogoLiverpool from "@/public/github-icon-2.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { $Enums } from "@prisma/client";
import { RecentMatch } from "../interfaces/InterfaceApiAccueil";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Activity } from "lucide-react";
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
    ?.map((r) => r.statsJoueur?.[0]?.note)
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

  if (!recentmatch || recentmatch.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Activity size={48} className="text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucun match joué
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Les 5 derniers matchs s&apos;afficheront ici après les premières rencontres
          </p>
        </div>
      </div>
    );
  }

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
              className={`${GetRatingColor(averageRating)} text-sm md:text-lg rounded-2xl font-extralight tracking-tight`}
            >
              {averageRating === 0 ? "?" : averageRating.toFixed(2) }
            </Badge>
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 mt-2 ">
        <div className="flex flex-wrap justify-between bg-red-700 gap-2 sm:gap-3 lg:gap-4">
          {prepareMatchesData()?.map((match) => (
            <div
              key={match.id}
              className="flex  flex-col items-center space-y-1 sm:space-y-2 p-2  rounded-xl   sm:min-w-[100px] lg:min-w-[70px]"
            >
              <div className="">
                <Image
                  alt="Logo Club"
                  src={LogoLiverpool}
                  className="w-18 h-18  md:w-[70px] md:h-[70px] rounded-full"
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
                          className={`${GetRatingColor(match.statsJoueur?.[0]?.note || 0)} rounded-full w-10 h-10  md:w-14 md:h-14 flex items-center justify-center text-md md:text-xl font-bold`}
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
