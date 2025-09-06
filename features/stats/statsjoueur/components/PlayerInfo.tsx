"use client";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import React from "react";
import LogoClub from "@/public/Logo_Manchester_City_2016.svg";

function PlayerInfo() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="relative flex flex-col justify-center items-center">
        <Image
          className="rounded-full"
          alt="Image joueur"
          src={session?.user.image || ""}
          width={170}
          height={170}
        />
        {/* Badge stylé façon Lautaro Martinez avec ton style texte */}
        <Badge className="absolute left-1/2  -translate-x-1/2 -bottom-5 w-54 rounded-xl flex flex-col items-center ">
          <p className="font-light text-base tracking-tighter ">
            {session?.user.name}
          </p>
        </Badge>
      </div>

      <div className="flex  gap-2 items-center justify-center mt-6">
        <Image alt="logo club" src={LogoClub} width={22} height={22}></Image>
        <p className="tracking-tighter">Manchester City</p>
      </div>

      <div className="flex gap-10 mt-4">
        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">23</p>
          <p className="text-md tracking-tighter font-lighter">buts</p>
        </div>

        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">23</p>
          <p className="text-md tracking-tighter font-lighter">buts</p>
        </div>

        <div className="flex flex-col gap-2 items-center ">
          <p className="text-3xl font-bold">23</p>
          <p className="text-md tracking-tighter font-lighter">buts</p>
        </div>
      </div>
    </div>
  );
}

export default PlayerInfo;
