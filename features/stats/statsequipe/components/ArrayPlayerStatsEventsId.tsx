import { StatsJoueur } from "@/features/evenements/types/TypesEvenements";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

import Image from "next/image";
import { CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSupprimerStatsJoueur } from "../../statsjoueur/hooks/useSupprimerStatsJoueur";
import { BoutonSupprimer } from "@/components/Boutons/BoutonSupprimer";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { ModalButtonEditPlayerStats } from "../../statsjoueur/components/ModalButtonUpdatePlayerStats";

interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  eventId: string;
}


const BadgeNote = (note: number) => {
  if (5 >= note) return "bg-red-600";
  else if (6 >= note) return "bg-orange-500";
  else if (7 >= note) return "bg-green-400";
  else return "bg-green-500";
};

function ArrayPlayerStatsEventsId({ statsJoueur, eventId }: Props) {
  const { mutate, isPending } = useSupprimerStatsJoueur();
  const { data, isLoading } = useInfosClub();

  const entraineur = data?.role === "ENTRAINEUR";

  console.log("Role de la personne : " + data?.role);

  const DeletePlayerStats = (playerId: string, statisticId: string) => {
    mutate({ eventId, joueurid: playerId, statistiqueid: statisticId });
  };


  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="p-4">
              <Checkbox />
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Avatar
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Nom
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Buts
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Passes décisive
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Poste
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Titulaire
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Note
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Minutes jouées
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Actions
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {statsJoueur?.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="p-4">
                <Checkbox />
              </TableCell>
              <TableCell>
                {m.image ? (
                  <Image
                    src={m.image}
                    width={35}
                    height={35}
                    alt={m.nom}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {m.nom?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.nom}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.buts}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.passesdecisive}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.poste || "Sans poste"}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                <Badge
                  className={`rounded-md border text-md  ${
                    m.titulaire
                      ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                      : "border-red-800 bg-red-200 text-red-800"
                  }`}
                >
                  {m.titulaire ? (
                    <CircleCheck size={16} className="mr-1" />
                  ) : (
                    <CircleX size={16} className="mr-1" />
                  )}
                  {m.titulaire ? "Oui" : "Non"}
                </Badge>
              </TableCell>
              <TableCell className="text-black dark:text-white">
                <div
                  className={`border rounded-md flex items-center justify-center w-10 ${BadgeNote(m.note)}`}
                >
                  <p className="text-white"> {m.note}</p>
                </div>
              </TableCell>
              <TableCell className="text-black dark:text-white">
                <div className="bg-gray-700 dark:bg-black border rounded-md flex items-center justify-center w-10">
                  <p className="text-white"> {m.minutesJouees}</p>
                </div>
              </TableCell>
              {entraineur && (
                <TableCell className="text-black dark:text-white">
                  <div className="flex gap-2">
                    <ModalButtonEditPlayerStats eventid={eventId} joueur={m}></ModalButtonEditPlayerStats>
                    <BoutonSupprimer supprimer={() => DeletePlayerStats(m.idUtilisateur, m.id)} disabled={isPending}></BoutonSupprimer>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default ArrayPlayerStatsEventsId;
