// import Image from "next/image";
import React from "react";
import { $Enums } from "@prisma/client";
import { StatistiqueJoueur } from "@/features/stats/statsjoueur/interface-types/interfacetype";
import { StatistiqueEquipeID } from "@/features/stats/statsequipe/interface/InterfaceStatsEquipe";
import Link from "next/link";
import {  ChartNoAxesCombined, Star, ThumbsDown, } from "lucide-react";


interface Props {
   Role : $Enums.RoleEquipe | undefined
   statsJoueurData:  StatistiqueJoueur | undefined
   StatsEquipeData: StatistiqueEquipeID | undefined
}


function StatsPrincipal({Role, statsJoueurData, StatsEquipeData} : Props) {


    const coach = Role === "ENTRAINEUR"


    const statsPlayer = statsJoueurData?.statsjoueur
    const statsTeam = StatsEquipeData?.statsequipe


  return (
    <div className="">
        <div className="flex justify-end mb-4">
        <Link
          href={"/dashboardfoothub/statistiques"}
          className="flex justify-end text-lg hover:underline font-bold tracking-tighter"
        >
          Stats club →
        </Link>
      </div>
    <div className="flex justify-center items-center gap-10">
    
      <div className="flex justify-center items-center flex-col gap-7 p-4 "> 
        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
            <ChartNoAxesCombined size={34} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Taux Victoire" : "Totals Buts"}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.tauxVictoire + "%"  : statsPlayer?.totalbuts}</p>
            </div>
          </div>
        </div>


        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              {coach? <ThumbsDown size={24} /> : <Star size={24} /> }
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Total défaites" : "Note Moyenne"}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.totalDefaites : statsPlayer?.notemoyenne.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
      </div>


       <div className="flex justify-center items-center flex-col gap-7 p-4 "> 
        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
            <ChartNoAxesCombined size={34} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Total matchs" : "Total matchs"}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.totalMatch  : statsPlayer?.totalmatch}</p>
            </div>
          </div>
        </div>


        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              {coach? <ThumbsDown size={24} /> : <Star size={24} /> }
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Total points" : "Note Moyenne"}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.totalPoints : statsPlayer?.notemoyenne.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
      </div>


       <div className="flex justify-center items-center flex-col gap-7 p-4 "> 
        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6"> 
          <div className="flex gap-4">
            <div>
            <ChartNoAxesCombined size={34} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Taux Victoire" : "Totals Buts"}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.tauxVictoire + "%"  : statsPlayer?.totalbuts}</p>
            </div>
          </div>
        </div>


        <div className="border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6">
          <div className="flex gap-4">
            <div>
              {coach? <ThumbsDown size={24} /> : <Star size={24} /> }
            </div>
            <div className="flex flex-col">
                 <p className="text-sm md:text-2xl tracking-tight font-medium">{coach ? "Total Victoire" : "Total G+A "}</p>
              <p className="font-semibold text-lg md:text-xl tracking-tight">{coach ? statsTeam?.totalVictoires : statsPlayer?.totalcontribution}</p>
            </div>
          </div>
        </div>
        
      </div>


      


    
    </div>
    </div>
  );
}


export default StatsPrincipal;
