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
    <div className="m-2">
      <div className="flex justify-between p-4 ">
    <p className="text-sm md:text-lg font-light tracking-tighter ">
          Infos Club
        </p>
        <Link
          href={"/dashboardfoothub/effectif"}
          className=" text-sm md:text-lg font-medium  tracking-tighter hover:underline "
        >
          Effectif complet
        </Link>
      </div>

      <div className=" flex flex-col justify-center items-center mb-8 ">
        <Image
          className="rounded-full w-[90] h-[90] md:w-[140] md:h-[140]"
          alt="Image joueur"
          src={Logo}
        />
        <Badge className=" w-26 md:w-44 rounded-xl flex flex-col items-center ">
          <p className="font-medium text-xs md:text-sm tracking-tighter ">
            {clubData?.equipe.nom}
          </p>
        </Badge>

        <div className="flex gap-10 mt-6">
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
