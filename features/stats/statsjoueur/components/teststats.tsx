"use client";

import React from "react";
import { UseStatistiqueJoueur } from "../hooks/useStatistiquesJoueur";
import { Bluetooth, TrendingUp } from "lucide-react";
import SkeletonBlockStatsJoueur from "./SkeletonBlockStatsJoueur";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";

function BlockStatsJoueur() {
  const { data, isLoading } = UseStatistiqueJoueur();
  const {data : dataclub , isLoading : InfosClubLoading} = useInfosClub()

  console.log(dataclub?.equipe.id)

  const {
    totalmatch,
    totalbuts,
    totalpassedecisive,
    totalcontribution,
    notemoyenne,
    nombrematchtitulaire,
    pourcentageTitulaire,
    pourcentagebutparmatch,
    pourcentagepassedeciviseparmatch,
    GA90,
    Buts90,
    PasseDecisives90,
  } = data?.statsjoueur ?? {};

  if (isLoading) return <SkeletonBlockStatsJoueur />;
if (!data || data.statsjoueur.totalmatch === 0) return <p className="text-center text-4xl">Vous n'avez jouer aucun match</p>;

  return (
    <div className="flex flex-wrap   mt-5 justify-evenly ">
      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={17} />
          </div>
        </div>
      </div>

      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Matchs</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalmatch}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={17} />
          </div>
        </div>
      </div>

      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Note moyenne</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{notemoyenne}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={17} />
          </div>
        </div>
      </div>

      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Passes décisive</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{totalpassedecisive}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={17} />
          </div>
        </div>
      </div>

      <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">GA</p>
        </div>
        <div className="flex items-center">
          <p className="p-3 text-4xl">{GA90}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockStatsJoueur;
