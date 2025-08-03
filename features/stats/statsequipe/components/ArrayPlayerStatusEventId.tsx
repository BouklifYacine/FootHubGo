import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox"
import { Presence } from '@/features/evenements/types/TypesEvenements';
import { ModalButtonAddPlayerStats } from '../../statsjoueur/components/ModalButtonAddPlayerStats';

interface Props {
  presences: Presence[] | undefined;
  statsteamid : { 
    idstatsequipe: string | undefined;
    eventid: string;
  } 
}

function ArrayPlayerStatusEventId({presences, statsteamid} : Props) {

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
                Poste
              </TableHeadCell>
              <TableHeadCell className="text-black dark:text-white">
                Status
              </TableHeadCell>
               <TableHeadCell className="text-black dark:text-white">
                Actions
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
                 <TableCell className="text-black dark:text-white">
                 {statsteamid.idstatsequipe && m.poste &&  <ModalButtonAddPlayerStats playerid={m.idUtilisateur} eventid={statsteamid.eventid}></ModalButtonAddPlayerStats> }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </>
  )
}

export default ArrayPlayerStatusEventId