import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { PlayerLeaderboard } from "../interfaces/InterfaceApiAccueil";

interface Props {
  TopAssists : PlayerLeaderboard[] | undefined,
  TopScorers :  PlayerLeaderboard[] | undefined,
}

function LeaderboardTeam({TopAssists,TopScorers} : Props) {

  console.log(TopAssists)

  const [ShowGoals, setShowGoals] = useState(!false)
  return (
    <div className="w-full max-w-2xl rounded-xl bg-red-500 p-4 border border-gray-200">
      <div className="flex justify-between  ">
        <p>{ShowGoals? "Top buteurs" : "Top Passeurs"}</p>
        <div className="flex items-center gap-2">
          <Switch id="airplane-mode" checked={ShowGoals} onCheckedChange={setShowGoals} />
          <Label htmlFor="airplane-mode">{ShowGoals? "Buteur" : "Passeurs"}</Label>
        </div>
      </div>

     {TopAssists?.map((a) => (
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
        <p>{a.playerName}</p>
        <p>{a.playerPosition}</p>
      </div>
    </div>
    <p>{a._sum.passesdecisive} {a._sum.passesdecisive != null && a._sum.passesdecisive  > 1 ? "Passes" : "Passe"}</p>
  </div>
))}

    </div>
  );
}

export default LeaderboardTeam;
