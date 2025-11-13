import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { PlayerLeaderboard } from "../interfaces/InterfaceApiAccueil";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface Props {
  TopAssists: PlayerLeaderboard[] | undefined;
  TopScorers: PlayerLeaderboard[] | undefined;
}

function LeaderboardTeam({ TopAssists, TopScorers }: Props) {
  const [ShowGoals, setShowGoals] = useState(!false);

  if (TopAssists?.length === 0 && TopScorers?.length === 0)
    return (
      <div className="flex items-center justify-center w-full h-full py-8 lg:py-12">
        <div className="flex flex-col items-center gap-3 lg:gap-4 text-center px-4">
          <TrendingUp className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 dark:text-gray-600" />
          <p className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucune statistique disponible
          </p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
            Les classements apparaîtront après les premiers matchs
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 mb-4 lg:mb-5">
        <h3 className="text-base lg:text-lg tracking-tight font-bold">
          {ShowGoals ? "Classement Buteurs" : "Classement Passeurs"}
        </h3>
        <div className="flex items-center gap-2">
          <Switch checked={ShowGoals} onCheckedChange={setShowGoals} />
          <Label className="text-xs lg:text-sm tracking-tight cursor-pointer">
            {ShowGoals ? "Buteurs" : "Passeurs"}
          </Label>
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="flex flex-col gap-3 lg:gap-4">
        {ShowGoals ? (
          TopScorers && TopScorers.length > 0 ? (
            TopScorers.map((a, index) => (
              <div
                key={a.id}
                className={`flex justify-between items-center py-2 lg:py-3 ${
                  index !== TopScorers.length - 1
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }`}
              >
                <div className="flex gap-2 lg:gap-3 items-center min-w-0 flex-1">
                  <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0">
                    <Image
                      alt={`Photo de ${a.playerName}`}
                      src={a.playerImage || Logo}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="tracking-tight font-medium text-sm lg:text-base truncate">
                      {a.playerName}
                    </p>
                    <Badge className="tracking-tight text-xs px-2 py-0.5 w-fit mt-1">
                      {a.playerPosition}
                    </Badge>
                  </div>
                </div>

                <p className="tracking-tight text-sm lg:text-base font-semibold ml-2 flex-shrink-0">
                  {a._sum.buts}{" "}
                  <span className="text-xs lg:text-sm font-normal text-gray-600 dark:text-gray-400">
                    {a._sum.buts != null && a._sum.buts > 1 ? "Buts" : "But"}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
                Aucun buteur pour le moment
              </p>
            </div>
          )
        ) : TopAssists && TopAssists.length > 0 ? (
          TopAssists.map((a, index) => (
            <div
              key={a.id}
              className={`flex justify-between items-center py-2 lg:py-3 ${
                index !== TopAssists.length - 1
                  ? "border-b border-gray-200 dark:border-gray-700"
                  : ""
              }`}
            >
              <div className="flex gap-2 lg:gap-3 items-center min-w-0 flex-1">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0">
                  <Image
                    alt={`Photo de ${a.playerName}`}
                    src={a.playerImage || Logo}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <p className="tracking-tight font-medium text-sm lg:text-base truncate">
                    {a.playerName}
                  </p>
                  <Badge className="tracking-tight text-xs px-2 py-0.5 w-fit mt-1">
                    {a.playerPosition}
                  </Badge>
                </div>
              </div>

              <p className="tracking-tight text-sm lg:text-base font-semibold ml-2 flex-shrink-0">
                {a._sum.passesdecisive}{" "}
                <span className="text-xs lg:text-sm font-normal text-gray-600 dark:text-gray-400">
                  {a._sum.passesdecisive != null && a._sum.passesdecisive > 1
                    ? "Passes"
                    : "Passe"}
                </span>
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
              Aucun passeur pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardTeam;
