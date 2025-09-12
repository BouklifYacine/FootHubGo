import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import { $Enums } from "@prisma/client";
import Link from "next/link";

interface Props {
  Role: $Enums.RoleEquipe;
  clubData: InfosClubApiResponse | undefined;
}

function InfosTeamAccueil({ clubData, Role }: Props) {
  const coach = Role === "ENTRAINEUR";
  return (
    <div className=" max-w-md border-2 border-gray-300 rounded-3xl mt-10 p-4">
      <div className="flex justify-between">
        <p className="text-end p-2 text-lg font-bold traci ">
          Infos Club
        </p>
       <Link href={"/dashboardfoothub/effectif"} className="text-end p-2 text-lg font-light tracking-tighter hover:underline ">
          Effectif complet
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="relative flex flex-col justify-center items-center">
          <Image
            className="rounded-full w-[120] h-[120] md:w-[170] md:h-[170]"
            alt="Image joueur"
            src={Logo}
          />
          <Badge className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-36 md:w-54 rounded-xl flex flex-col items-center ">
            <p className="font-medium text-sm md:text-base tracking-tighter ">
              {clubData?.equipe.nom}
            </p>
          </Badge>
        </div>

        <div className="flex  gap-2 items-center justify-center mt-8">
          <p className="text-sm"> Niveau : </p>
          <Badge className="rounded-full">
            {" "}
            <p className="tracking-tighter font-bold">
              {clubData?.equipe.niveau}
            </p>
          </Badge>
        </div>

        <div className="flex gap-10 mt-4">
          <div className="flex flex-col  items-center ">
            <p className="text-xl md:text-3xl font-bold">
              {clubData?.membres.length}
            </p>
            <p className="text-sm md:text-lg tracking-tighter font-lighter">
              Membres Team
            </p>
          </div>

          {coach ? (
            <div className="flex flex-col  items-center justify-center ">
              <p className="text-xl md:text-3xl font-bold">
                {clubData?.equipe.codeInvitation}
              </p>
              <p className=" text-sm md:text-lg tracking-tighter font-medium">
                Code Invitation{" "}
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default InfosTeamAccueil;
