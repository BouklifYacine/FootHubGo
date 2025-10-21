"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  ChartNoAxesCombined,
  Ellipsis,
  House,
  TrafficCone,
  Trophy,
} from "lucide-react";
import SelectPresence from "./SelectPresence";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { ColorBadgeEvent } from "@/lib/ColorBadgeEvent";
import { EvenementsAPI } from "../types/TypesEvenements";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import { UseMutateFunction } from "@tanstack/react-query";

interface Props {
  filteredEvents : EvenementsAPI | undefined
  infosdata : InfosClubApiResponse | undefined
  isPending : boolean
   mutate: UseMutateFunction< { success: boolean; message: string },Error, string>
}

function CardEvenement({filteredEvents,infosdata, isPending, mutate} : Props) {
  const router = useRouter();

  const entraineur = infosdata?.role === "ENTRAINEUR";
  filteredEvents?.evenements.map((e) => e.typeEvenement === "ENTRAINEMENT")
  
  const handleModifier = (id: string) => {
    router.push(`/dashboardfoothub/evenements/${id}/modifier`);
  };

  const RoutingEvenementId = (id : string) => {
    router.push(`/dashboardfoothub/evenements/${id}`);
  }

  return (
    <>
      {filteredEvents?.evenements.map((e) => (
        
        <div className=" rounded-xl border border-gray-400 w-2xl" key={e.id}>
          <div className="flex flex-col items-start">
            <div className="flex items-center  justify-between w-full ">
              <h1 className="text-xl md:text-3xl mb-4 mt-4 ml-4 font-bold text-black dark:text-white tracking-tighter">
                {e.adversaire || e.titre}
              </h1>

              <div className="flex">
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
                    <DropdownMenuItem onClick={() => handleModifier(e.id)}>
                      Modifier
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => mutate(e.id)}
                      disabled={isPending}
                    >
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {entraineur && entraineur && e.typeEvenement === "ENTRAINEMENT" !== true && (
                      <ChartNoAxesCombined
                      onClick={() => RoutingEvenementId(e.id)}
                        size={25}
                        className="text-white  dark:text-black mr-3 bg-black dark:bg-white rounded-3xl p-0.5 cursor-pointer"
                      />
                    )}
                  </DropdownMenuTrigger>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4 ml-4">
              <div className="flex gap-2  ">
                <Calendar />
                <p>
                  {dayjs(e.dateDebut.toString()).format(`DD/MM/YYYY `)}{" "}
                  {dayjs(e.dateDebut.toString()).format(`H`)}
                  {"h"}
                  {dayjs(e.dateDebut.toString()).format(`mm`)}
                </p>
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
              <SelectPresence
                typeEvent={e.typeEvenement}
                id={e.id}
                value={e.statutPresence}
                date={e.dateDebut}
               
              />
            )}
            <Badge
              className={`${ColorBadgeEvent(e.typeEvenement)} mr-3 rounded-lg`}
            >
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
