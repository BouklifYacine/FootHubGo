import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";

function LeaderboardTeam() {
  return (
    <div className="w-full max-w-2xl rounded-xl bg-red-500 p-4 border border-gray-200">
      <div className="flex justify-between  ">
        <p>Top Buteurs</p>
        <div className="flex items-center gap-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      </div>

      <div className="flex justify-between mt-4 items-center ">
        <div className="flex gap-2">
          <Image
            alt="logo joueur"
            src={Logo}
            width={50}
            height={50}
            className="rounded-2xl"
          ></Image>
          <div className="flex flex-col">
            <p>Karim Benzema</p>
            <p>Karim Benzema</p>
          </div>
        </div>
        <p>18 buts</p>
      </div>
    </div>
  );
}

export default LeaderboardTeam;
