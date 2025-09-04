"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { StatistiqueEquipeID } from "../interface/InterfaceStatsEquipe";

interface Props {
  StatsEquipeData : StatistiqueEquipeID | undefined 
}

function FullStatsTeam({StatsEquipeData} : Props) {

  const stats = StatsEquipeData?.statsequipe

  console.log("chab les stats + " + stats)

  return (
    <div className="flex gap-10">
    
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center font-light">
            {stats?.totalMatch ?? "-"}
          </Badge>
          <p className="tracking-tight">Total matchs</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.totalVictoires ?? "-"}
          </Badge>
          <p className="tracking-tight">Victoires</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.totalDefaites ?? "-"}
          </Badge>
          <p className="tracking-tight">Défaites</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.tauxVictoire ? `${stats.tauxVictoire}%` : "-"}
          </Badge>
          <p className="tracking-tight">Taux victoire</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.totalPoints ?? "-"}
          </Badge>
          <p className="tracking-tight">Points</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.totalButsMarques ?? "-"}
          </Badge>
          <p className="tracking-tight">Buts marqués</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.differenceButsGlobale ?? "-"}
          </Badge>
          <p className="tracking-tight">Différence buts</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.totalCleanSheets ?? "-"}
          </Badge>
          <p className="tracking-tight">Clean sheets</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.tauxCleanSheet ? `${stats.tauxCleanSheet}%` : "-"}
          </Badge>
          <p className="tracking-tight">Taux clean sheet</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.moyenneButsMarquesParMatch ?? "-"}
          </Badge>
          <p className="tracking-tight">Moy. buts marqués</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.moyenneButsEncaissesParMatch ?? "-"}
          </Badge>
          <p className="tracking-tight">Moy. buts encaissés</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.victoiresDomicile ?? "-"}
          </Badge>
          <p className="tracking-tight">Victoires domicile</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.defaitesDomicile ?? "-"}
          </Badge>
          <p className="tracking-tight">Défaites domicile</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.tauxVictoiresDomicile ? `${stats.tauxVictoiresDomicile}%` : "-"}
          </Badge>
          <p className="tracking-tight">Taux vict. domicile</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.differenceButsDomicile ?? "-"}
          </Badge>
          <p className="tracking-tight">Diff. buts domicile</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.moyennePointsDomicile ?? "-"}
          </Badge>
          <p className="tracking-tight">Moy. points domicile</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.differenceButsExterieur ?? "-"}
          </Badge>
          <p className="tracking-tight">Diff. buts extérieur</p>
        </div>

        <div className="flex gap-2 items-center">
          <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
            {stats?.moyennePointsExterieur ?? "-"}
          </Badge>
          <p className="tracking-tight">Moy. points extérieur</p>
        </div>
      </div>
    </div>
  );
}

export default FullStatsTeam;