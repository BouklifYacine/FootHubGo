"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Ellipsis, House, TrafficCone, Trophy } from "lucide-react";
import SelectPresence from "./SelectPresence";
import { Badge } from "@/components/ui/badge";
import { useEvenements } from "../hooks/useEvenements";
import dayjs from "dayjs";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useSupprimerEvenement } from "../hooks/useSupprimerEvenement";

function CardEvenement() {
  const { data } = useEvenements();
  const { data: infosdata } = useInfosClub();
  const {mutate, isPending} =  useSupprimerEvenement()
  const entraineur = infosdata?.role === "ENTRAINEUR";
  
  return (
    <>
      {data?.evenements.map((e) => (
        <div className=" rounded-xl border border-gray-400 w-2xl" key={e.id}>
          <div className="flex flex-col items-start">
            <div className="flex items-center  justify-between w-full ">
              <h1 className="text-xl md:text-3xl mb-4 mt-4 ml-4 font-bold text-black dark:text-white tracking-tighter">
                {e.adversaire || "aucune équipe"}
              </h1>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {entraineur ? (
                    <Ellipsis
                      size={25}
                      className="text-white  dark:text-black mr-3 bg-black dark:bg-white rounded-3xl p-0.5 cursor-pointer"
                    />
                  ) : (
                    ""
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="center">
                  <DropdownMenuItem>Modifier </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => mutate(e.id)} disabled={isPending}>Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2 mb-4 ml-4">
              <div className="flex gap-2  ">
                <Calendar />
                <p>{dayjs(e.dateDebut.toString()).format("DD/MM/YYYY")}</p>
              </div>

              <div className="flex gap-2 ">
                <House />
                <p>{e.lieu || "Lieu non indiqué"} </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            {entraineur ? (
              <div className="w-[140px] my-9 mx-4  "></div>
            ) : (
              <SelectPresence className={entraineur ? "invisible" : ""} />
            )}
            <Badge className="text-green-700 bg-green-200 text-sm mr-3 rounded-md border border-green-700">
              {e.typeEvenement}{" "}
              {e.typeEvenement === "ENTRAINEMENT" ? (
                <TrafficCone size={20} className="ml-1" />
              ) : (
                <Trophy size={19} className="ml-1" />
              )}
            </Badge>
          </div>
        </div>
      ))}
    </>
  );
}

export default CardEvenement;
