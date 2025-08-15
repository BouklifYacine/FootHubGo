"use client";

import React from "react";
import { Trophy, X, BarChart2, Users } from "lucide-react";
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

  if (StatsEquipeIsLoading) return <SkeletonBlockStats />;

  if (!StatsEquipeData || totalmatch === 0)
    return (
      <p className="text-center text-4xl">
        Cette équipe n'a joué aucun match
      </p>
    );

  return (
    <div className="flex flex-wrap mt-5 justify-evenly">
      {/* Total Matchs */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Users size={26} />
          <p className="text-2xl">Total Matchs</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalmatch}</p>
          <div className="bg-blue-300 rounded-lg p-1">
            <BarChart2 className="text-blue-500" size={17} />
          </div>
        </div>
      </div>
      {/* Total Victoires */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Trophy size={26} />
          <p className="text-2xl">Total Victoires</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalVictoires}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <Trophy className="text-green-500" size={17} />
          </div>
        </div>
      </div>
      {/* Total Défaites */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <X size={26} />
          <p className="text-2xl">Total Défaites</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalDefaites}</p>
          <div className="bg-red-300 rounded-lg p-1">
            <X className="text-red-500" size={17} />
          </div>
        </div>
      </div>
      {/* Total Buts Marqués */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Trophy size={26} />
          <p className="text-2xl">Total Buts Marqués</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalButsMarques}</p>
          <div className="bg-yellow-300 rounded-lg p-1">
            <Trophy className="text-yellow-500" size={17} />
          </div>
        </div>
      </div>
      {/* Différence de Buts Globale */}
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <BarChart2 size={26} />
          <p className="text-2xl">Différence de Buts</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{differenceButsGlobale}</p>
          <div className="bg-purple-300 rounded-lg p-1">
            <BarChart2 className="text-purple-500" size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockStatsEquipe;