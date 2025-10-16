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
      <div className="flex items-center justify-center w-full h-full py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <TrendingUp size={48} className="text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucune statistique disponible
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Les classements apparaîtront après les premiers matchs
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full max-w-xl rounded-3xl p-4">
      <div className="flex justify-between">
        <p className="text-lg tracking-tighter font-bold">
          {ShowGoals ? "Classement Buteurs" : "Classement Passeurs"}
        </p>
        <div className="flex items-center gap-2">
          <Switch checked={ShowGoals} onCheckedChange={setShowGoals} />
          <Label className="text-lg tracking-tighter">
            {ShowGoals ? "Buteur" : "Passeurs"}
          </Label>
        </div>
      </div>

      {ShowGoals ? (
        TopScorers && TopScorers.length > 0 ? (
          TopScorers.map((a) => (
            <div key={a.id} className="flex justify-between mt-5 items-center">
              <div className="flex gap-2">
                <Image
                  alt="logo joueur"
                  src={a.playerImage || Logo}
                  width={65}
                  height={65}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <div>
                    <p className="tracking-tight font-medium text-xl">
                      {a.playerName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge className="tracking-tight">
                      {a.playerPosition}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="tracking-tighter text-xl font-medium">
                {a._sum.buts}{" "}
                {a._sum.buts != null && a._sum.buts > 1 ? "Buts" : "But"}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Aucun buteur pour le moment
            </p>
          </div>
        )
      ) : TopAssists && TopAssists.length > 0 ? (
        TopAssists.map((a) => (
          <div key={a.id} className="flex justify-between mt-4 items-center">
            <div className="flex gap-2">
              <Image
                alt="logo joueur"
                src={a.playerImage || Logo}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <div>
                  <p className="tracking-tight font-medium">{a.playerName}</p>
                </div>
                <div className="flex items-center">
                  <Badge className="tracking-tight ">{a.playerPosition}</Badge>
                </div>
              </div>
            </div>
            <p className="tracking-tighter text-lg font-medium ">
              {a._sum.passesdecisive}{" "}
              {a._sum.passesdecisive != null && a._sum.passesdecisive > 1
                ? "Passes"
                : "Passe"}
            </p>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Aucun passeur pour le moment
          </p>
        </div>
      )}
    </div>
  );
}

export default LeaderboardTeam;
