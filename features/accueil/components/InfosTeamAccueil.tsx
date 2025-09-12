import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

function InfosTeamAccueil() {
  return (
    <div className="flex flex-col justify-center items-center max-w-md border border-gray-200 rounded-3xl mt-10 p-4 ">
      <div className="relative flex flex-col justify-center items-center">
        <Image
          className="rounded-full"
          alt="Image joueur"
          src={Logo}
          width={170}
          height={170}
        />
        <Badge className="absolute left-1/2  -translate-x-1/2 -bottom-5 w-54 rounded-xl flex flex-col items-center ">
          <p className="font-light text-base tracking-tighter ">Fc Salah</p>
        </Badge>
      </div>

      <div className="flex  gap-2 items-center justify-center mt-6">
        <p> Niveau : </p>
        <Badge>
          {" "}
          <p className="tracking-tighter">Norhane</p>
        </Badge>
      </div>

      <div className="flex gap-10 mt-4">
        <div className="flex flex-col  items-center ">
          <p className="text-3xl font-bold">20</p>
          <p className="text-md tracking-tighter font-lighter">Matchs</p>
        </div>
      </div>
    </div>
  );
}

export default InfosTeamAccueil;
