"use client";

import React from "react";
import { Bluetooth, TrendingUp } from "lucide-react";
import { UseStatistiqueJoueur } from "../hooks/useStatistiquesJoueur";
import SkeletonBlockStats from "./SkeletonBlockStatsJoueur";
import { StatistiqueJoueur } from "../interface-types/interfacetype";

interface Props {
  statsJoueurData: StatistiqueJoueur | undefined
}

function BlockStatsJoueur({statsJoueurData} : Props) {
  const { data, isLoading } = UseStatistiqueJoueur();

  const {
    totalmatch,
    totalbuts,
    totalpassedecisive,
    notemoyenne,
    GA90,
  } = statsJoueurData?.statsjoueur ?? {};

  if (isLoading) return <SkeletonBlockStats />;
  if (!data || data.statsjoueur.totalmatch === 0)
    return (
      <p className="text-center text-4xl">
        Vous n'avez joué aucun match
      </p>
    );

  return (
    <div className="flex flex-wrap mt-5 justify-evenly">
      {/* Total Buts */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
         
          <p className="text-2xl">Total Buts</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalbuts}</p>
        
        </div>
      </div>
      {/* Total Matchs */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          
          <p className="text-2xl">Total Matchs</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalmatch}</p>
       
        </div>
      </div>
      {/* Note moyenne */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
     
          <p className="text-2xl">Note moyenne</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{notemoyenne}</p>
          
        </div>
      </div>
      {/* Total Passes décisives */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
       
          <p className="text-2xl">Total Passes décisives</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalpassedecisive}</p>
       
        </div>
      </div>
      {/* GA */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
        
          <p className="text-2xl">GA</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{GA90}</p>
        
        </div>
      </div>
    </div>
  );
}

export default BlockStatsJoueur;