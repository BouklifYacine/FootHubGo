"use client";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import React from "react";
import LogoClub from "@/public/Logo_Manchester_City_2016.svg";
import { StatistiqueEquipeID } from "../interface/InterfaceStatsEquipe";

interface Props {
  StatsEquipeData : StatistiqueEquipeID | undefined, 
  TeamName : string | undefined
}

function TeamInfo({StatsEquipeData,TeamName} : Props) {

    const stats = StatsEquipeData?.statsequipe;
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="relative flex flex-col justify-center items-center">
        <Image
          className="rounded-full"
          alt="Image joueur"
          src={LogoClub}
          width={170}
          height={170}
        />
        <Badge className="absolute left-1/2  -translate-x-1/2 -bottom-5 w-54 rounded-xl flex flex-col items-center ">
          <p className="font-light text-base tracking-tighter ">
            {TeamName}
          </p>
        </Badge>
      </div>

      <div className="flex  gap-2 items-center justify-center mt-6">
        <Image className="rounded-full" alt="logo club" src={session?.user.image || ""} width={22} height={22}></Image>
        <p className="tracking-tighter">{session?.user.name}</p>
      </div>

      <div className="flex gap-10 mt-4">
        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">{stats?.totalMatch}</p>
          <p className="text-md tracking-tighter font-lighter">Matchs</p>
        </div>

        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">{stats?.totalVictoires}</p>
          <p className="text-md tracking-tighter font-lighter">Victoires</p>
        </div>

        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">{stats?.totalDefaites}</p>
          <p className="text-md tracking-tighter font-lighter">Défaites</p>
        </div>
      </div>
    </div>
  );
}

export default TeamInfo;
