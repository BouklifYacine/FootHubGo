import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { PlayerLeaderboard } from "../interfaces/InterfaceApiAccueil";
import { Badge } from "@/components/ui/badge";

interface Props {
  TopAssists : PlayerLeaderboard[] | undefined,
  TopScorers :  PlayerLeaderboard[] | undefined,
}

function LeaderboardTeam({TopAssists,TopScorers} : Props) {

  const [ShowGoals, setShowGoals] = useState(!false)
  return (
    <div className="w-full max-w-2xl rounded-3xl  p-4 border border-gray-200 shadow shadow-green-500">
      <div className="flex justify-between  ">
        <p className="text-lg tracking-tighter font-bold">{ShowGoals? "Classement Buteurs" : "Classement Passeurs"}</p>
        <div className="flex items-center gap-2">
          <Switch  checked={ShowGoals} onCheckedChange={setShowGoals} />
          <Label className="text-lg tracking-tighter" >{ShowGoals? "Buteur" : "Passeurs"}</Label>
        </div>
      </div>

  {ShowGoals ? (
  TopScorers?.map((a) => (
    <div key={a.id} className="flex justify-between mt-5 items-center">
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
           <Badge className="tracking-tight">{a.playerPosition}</Badge>
        </div>
        </div>
      </div>
      <p className="tracking-tighter text-lg font-medium">{a._sum.buts} {a._sum.buts != null && a._sum.buts > 1 ? "Buts" : "But"}</p>
    </div>
  ))
) : (
  TopAssists?.map((a) => (
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
      <p className="tracking-tighter text-lg font-medium ">{a._sum.passesdecisive} {a._sum.passesdecisive != null && a._sum.passesdecisive > 1 ? "Passes" : "Passe"}</p>
    </div>
  ))
)}


    </div>
  );
}

export default LeaderboardTeam;
