"use client";
import React, { useState } from "react";
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
import { Presence, StatsJoueur } from "../../types/TypesEvenements";
import { Button } from "@/components/ui/button";

interface Props {
  statsJoueur: StatsJoueur[] | undefined;
  presences: Presence[] | undefined;
}

const BadgeNote = (note: number) => {
  if (5 >= note) return "bg-red-600";
  else if (6 >= note) return "bg-orange-500";
  else if (7 >= note) return "bg-green-400";
  else return "bg-green-500";
};

function TableauStatsJoueurEvenement({ statsJoueur, presences }: Props) {
  const [affichage, setAffichage] = useState(false);

  const GererAffichage = () => {
    setAffichage(!affichage);
  };

  
  return (
    <div className="overflow-x-auto mt-10">
      <Button onClick={GererAffichage} className="mb-2"> {affichage ? "Tableau Stats" : "Tableau présence"} </Button>

      {affichage ? (
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
              
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
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
                Poste
              </TableHeadCell>
              <TableHeadCell className="text-black dark:text-white">
                Status
              </TableHeadCell>
          
            
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {presences?.map((m) => (
              <TableRow key={m.idUtilisateur}>
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
                  {m.poste ? m.poste : "ENTRAINEUR"}
                </TableCell>
                <TableCell className="text-black dark:text-white">
                  {m.statut}
                </TableCell>
             
              
            

              
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default TableauStatsJoueurEvenement;
