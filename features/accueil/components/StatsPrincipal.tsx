import Image from "next/image";
import React from "react";
import { $Enums } from "@prisma/client";
import { StatistiqueJoueur } from "@/features/stats/statsjoueur/interface-types/interfacetype";
import { StatistiqueEquipeID } from "@/features/stats/statsequipe/interface/InterfaceStatsEquipe";
import Link from "next/link";
import { CalendarDays, ChartBar, ChartNoAxesCombined, Star, ThumbsDown, ThumbsUp } from "lucide-react";

interface Props {
    Role : $Enums.RoleEquipe
   statsJoueurData:  StatistiqueJoueur | undefined
   StatsEquipeData: StatistiqueEquipeID | undefined
}

function StatsPrincipal({Role, statsJoueurData, StatsEquipeData} : Props) {

    const coach = Role === "ENTRAINEUR"

    const statsPlayer = statsJoueurData?.statsjoueur
    const statsTeam = StatsEquipeData?.statsequipe

  return (
    <div className="border border-gray-200 shadow-lg shadow-blue-500 max-w-lg rounded-3xl mt-10">
      <Link href={"/dashboardfoothub/statistiques"} className="flex justify-end  hover:underline font-medium tracking-tight p-2 pr-4">Voir toute les stats</Link>
    <div className="  flex gap-10">
    
      <div className="flex flex-col gap-7 p-4 "> 
        <div className=" border border-gray-200  rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
            <ChartNoAxesCombined size={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-lg tracking-tight font-medium">{coach ? "Taux Victoire" : "Totals Buts"}</p>
              <p className="font-semibold text-lg md:text-3xl tracking-tight">{coach ? statsTeam?.tauxVictoire + "%"  : statsPlayer?.totalbuts}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              {coach? <ThumbsDown size={24} /> : <Star size={24} /> }
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-lg tracking-tight font-medium">{coach ? "Total défaites" : "Note Moyenne"}</p>
              <p className="font-semibold text-lg md:text-3xl tracking-tight">{coach ? statsTeam?.totalDefaites : statsPlayer?.notemoyenne.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
      </div>

        <div className="flex flex-col gap-7 p-4  "> 
        
        <div className=" border border-gray-200   rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
            {coach? <ThumbsUp size={24} /> : <ChartBar size={24} />  }
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-lg tracking-tight font-medium">{coach ? "Total Victoire" : "Total G+A "}</p>
              <p className="font-semibold text-lg md:text-3xl tracking-tight">{coach ? statsTeam?.totalVictoires : statsPlayer?.totalcontribution}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
            <CalendarDays size={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-lg tracking-tight font-medium">{coach ? "Total Matchs" : "Total Matchs"}</p>
              <p className="font-semibold text-lg md:text-3xl tracking-tight">{coach ? statsTeam?.totalMatch : statsPlayer?.totalmatch}</p>
            </div>
          </div>
        </div>
        
      </div>

    
    </div>
    </div>
  );
}

export default StatsPrincipal;
