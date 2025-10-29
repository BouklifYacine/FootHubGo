"use client"

import { BadgeTexteIcone } from "@/components/Badge/BadgeTexteIcone";
import { Button } from "@/components/ui/button";
import Liverpool from "@/public/action-de-footballeur-sur-le-stade.jpg";
import { Calendar, CircleCheck, CircleX, Clock, MapPin, UsersRound } from "lucide-react";
import { useGetCallUp } from "../hooks/UseGetCallUp";

function CallUpCard() {

 const {data, isPending} = useGetCallUp()
  return (
    <div className="bg-white rounded-xl w-[425px] mt-2 ">
      <div
        className="  rounded-t-lg  "
        style={{
          backgroundImage: `url(${Liverpool.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex justify-end p-2">
          <BadgeTexteIcone
            texte="Championnat"
            classname="tracking-tighter"
          ></BadgeTexteIcone>
        </div>

        <div className="flex p-2">
          <p className="text-2xl tracking-tighter text-white font-bold">
            Convocation match
          </p>
        </div>
      </div>

      <div className="p-2 mt-4 flex flex-col gap-4">
        <div className="flex items-center ">
          <div className="flex items-center gap-2">
        <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
  <Calendar className="w-6 h-6 text-white" />
</div>
            <p className="text-black">Samedi 16 Novembre</p>
          </div>
        </div>

         <div className="flex items-center ">
          <div className="flex items-center gap-2">
        <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
  <UsersRound className="w-6 h-6 text-white" />
</div>
            <p className="text-black">FC Vaulx en Velin</p>
          </div>
        </div>


        <div className="flex items-center ">
          <div className="flex items-center gap-2">
        <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
  <Clock className="w-6 h-6 text-white" />
</div>
            <p className="text-black">13H00</p>
          </div>
        </div>



        <div className="flex items-center ">
          <div className="flex items-center gap-2">
        <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center">
  <MapPin className="w-6 h-6 text-white" />
</div>
            <p className="text-black">Stade Vaulx en Velin </p>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-center gap-2 p-4">
        <Button className="w-47 bg-red-500 text-white tracking-tight font-bold cursor-pointer"> <CircleX /> Refuser </Button>
        <Button className="w-47 bg-green-500 text-white tracking-tight font-bold cursor-pointer"><CircleCheck /> Accepter </Button>
      </div>

      
    </div>
  );
}

export default CallUpCard;
