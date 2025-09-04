"use client";

import React from "react";
import { UseStatistiqueEquipeID } from "../../statsequipe/hooks/useStatistiqueEquipe";
import SkeletonBlockStats from "../../statsjoueur/components/SkeletonBlockStatsJoueur";

function BlockStatsEquipe({ idEquipe }: { idEquipe: string }) {
  const {
    data: StatsEquipeData,
    isLoading: StatsEquipeIsLoading,
  } = UseStatistiqueEquipeID(idEquipe);

  const totalmatch = StatsEquipeData?.statsequipe.totalMatch;
  const totalVictoires = StatsEquipeData?.statsequipe.totalVictoires;
  const totalDefaites = StatsEquipeData?.statsequipe.totalDefaites;
  const totalButsMarques = StatsEquipeData?.statsequipe.totalButsMarques;
  const differenceButsGlobale = StatsEquipeData?.statsequipe.differenceButsGlobale;

 const FormatDifferenceButs = (differencebuts: number): string => {
  if (differencebuts > 0) return `+${differencebuts}`;
  if (differencebuts < 0) return `${differencebuts}`;
  return "0";
};

  if (StatsEquipeIsLoading) return <SkeletonBlockStats />;

  if (!StatsEquipeData || totalmatch === 0)
    return (
      <p className="text-center text-4xl">
        Cette équipe n'a joué aucun match
      </p>
    );

  return (
    <div className="flex flex-wrap mt-5 justify-evenly gap-4">
      {/* Total Matchs */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <p className="text-2xl">Total Matchs</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalmatch}</p>
        </div>
      </div>
      {/* Total Victoires */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <p className="text-2xl">Total Victoires</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl text-green-500">{totalVictoires}</p>
        </div>
      </div>
      {/* Total Défaites */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
       
          <p className="text-2xl">Total Défaites</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl text-red-500">{totalDefaites}</p>
        </div>
      </div>
      {/* Total Buts Marqués */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
      
          <p className="text-2xl">Total Buts Marqués</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalButsMarques}</p>
        </div>
      </div>
      {/* Différence de Buts Globale */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <p className="text-2xl">Différence de Buts</p>
        </div>
        <div className="flex items-center">
          <p className={`p-3 text-4xl ${differenceButsGlobale! > 0 ? "text-green-500" : "text-red-500" }`}>{FormatDifferenceButs(differenceButsGlobale!)}</p>
        </div>
      </div>
    </div>
  );
}

export default BlockStatsEquipe;