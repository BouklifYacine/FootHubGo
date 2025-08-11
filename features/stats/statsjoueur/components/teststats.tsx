"use client";

import React from "react";
import { UseStatistiqueJoueur } from "../hooks/useStatistiquesJoueur";
import { Bluetooth, TrendingUp } from "lucide-react";

function BlockStatsJoueur() {
  const { data, isLoading } = UseStatistiqueJoueur();

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

  return (
    <div className="flex flex-wrap  gap-5 mt-5 justify-evenly ">
   

  <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>

        <div className="flex gap-1 items-center">
          <p className="p-3 text-4xl">{ totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={19} />
          </div>
        </div>
      </div>

      
 <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>

        <div className="flex gap-1 items-center">
          <p className="p-3 text-4xl">{ totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={19} />
          </div>
        </div>
      </div>

       <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>

        <div className="flex gap-1 items-center">
          <p className="p-3 text-4xl">{ totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={19} />
          </div>
        </div>
      </div>


       <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>

        <div className="flex gap-1 items-center">
          <p className="p-3 text-4xl">{ totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={19} />
          </div>
        </div>
      </div>


       <div className="border w-[400px] border-gray-400 rounded-xl">
        <div className="flex gap-0.5 p-3 items-center">
          <Bluetooth size={26} />
          <p className="text-2xl">Total Buts</p>
        </div>

        <div className="flex gap-1 items-center">
          <p className="p-3 text-4xl">{ totalbuts}</p>
          <div className="bg-green-300 rounded-lg p-1">
            <TrendingUp className="text-green-500" size={19} />
          </div>
        </div>
      </div>
      
       
     
    </div>
  );
}

export default BlockStatsJoueur;
