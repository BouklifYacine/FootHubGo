import Image from "next/image";
import React from "react";
import Crown from "@/public/3dicons-crown-front-color.png"
import { $Enums } from "@prisma/client";
import { StatistiqueJoueur } from "@/features/stats/statsjoueur/interface-types/interfacetype";
import { StatistiqueEquipeID } from "@/features/stats/statsequipe/interface/InterfaceStatsEquipe";

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
    <div className="bg-red-500 max-w-3xl flex gap-10"> 

      <div className="flex flex-col gap-7 p-4  "> 
        
        <div className=" border border-gray-200  rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
              <Image alt="Logo" src={Crown} height={40} width={40} />
            </div>
            <div className="flex flex-col">
              <p className="text-lg tracking-tight font-medium">{coach ? "Taux Victoire" : "Totals Buts"}</p>
              <p className="font-semibold text-2xl tracking-tight">{coach ? statsTeam?.tauxVictoire + "%"  : statsPlayer?.totalbuts}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              <Image alt="Logo" src={Crown} height={40} width={40} />
            </div>
            <div className="flex flex-col">
              <p className="text-xl tracking-tight font-light">{coach ? "Total défaites" : "Note Moyenne"}</p>
              <p className="font-semibold text-2xl tracking-tight">{coach ? statsTeam?.totalDefaites : statsPlayer?.notemoyenne}</p>
            </div>
          </div>
        </div>
        
      </div>

        <div className="flex flex-col gap-7 p-4  "> 
        
        <div className=" border border-gray-200   rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
              <Image alt="Logo" src={Crown} height={40} width={40} />
            </div>
            <div className="flex flex-col">
              <p className="text-lg tracking-tight font-medium">{coach ? "Total Victoire" : "Total G+A "}</p>
              <p className="font-semibold text-2xl tracking-tight">{coach ? statsTeam?.totalVictoires : statsPlayer?.totalcontribution}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              <Image alt="Logo" src={Crown} height={40} width={40} />
            </div>
            <div className="flex flex-col">
              <p className="text-xl tracking-tight font-light">{coach ? "Total Matchs" : "Total Matchs"}</p>
              <p className="font-semibold text-2xl tracking-tight">{coach ? statsTeam?.totalMatch : statsPlayer?.totalmatch}</p>
            </div>
          </div>
        </div>
        
      </div>

    
    </div>
  );
}

export default StatsPrincipal;
