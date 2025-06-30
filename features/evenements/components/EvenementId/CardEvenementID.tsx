"use client";
import { $Enums, StatistiqueEquipe } from "@prisma/client";
import React from "react";
import City from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Props {
  infosmatch: {
    date: Date | undefined;
    lieu: string | null | undefined;
    adversaire: string | null | undefined;
    typeEvenement: $Enums.TypeEvenement | undefined;
    titre: string | undefined;
    score: StatistiqueEquipe | null | undefined;
    nomequipe: string | undefined;
  };
}

const BadgeResultat = (resultat: $Enums.ResultatMatch | null | undefined) => {
  if (resultat === "VICTOIRE") {
    return "bg-green-500";
  } else if (resultat === "DEFAITE") {
    return "bg-red-500";
  } else {
    return "bg-gray-500";
  }
};

function CardEvenementID({ infosmatch }: Props) {
  return (
    <div className="border border-blue-500 rounded-2xl p-4">
      <div className="flex items-center justify-center ">
        <Badge
          className={`text-xl font-bold tracking-tighter rounded-xl ${BadgeResultat(infosmatch.score?.resultatMatch)}`}
        >
          {infosmatch.score?.resultatMatch}
        </Badge>
      </div>
      <div className="flex items-center justify-center gap-2">
           <p className="text-2xl font-bold mr-3">{infosmatch.nomequipe}</p>  <Image
          src={City}
          width={80}
          height={80}
          alt="equipe"
          className="mr-6"
        ></Image>
        <p className="text-5xl">{infosmatch.score?.butsMarques}</p>{" "}
        <span className="text-3xl">-</span>{" "}
        <p className="text-5xl">{infosmatch.score?.butsEncaisses}</p>{" "}
        <Image
          src={City}
          width={80}
          height={80}
          alt="equipe"
          className="ml-6"
        ></Image>
       <p className="text-2xl font-bold ml-3">{infosmatch.adversaire}</p>
      </div>
    </div>
  );
}

export default CardEvenementID;
