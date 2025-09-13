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
        <p className="text-xl">Infos Club</p>
        <p className="text-xl">Yacine</p>
      </div>

      <div className="flex flex-col justify-center items-center mt-2">
 <Image
            className="rounded-full w-[90] h-[90] md:w-[140] md:h-[140]"
            alt="Image joueur"
            src={Logo}
          />
      </div>
    </div>
  );
}

export default InfosTeamAccueil;
