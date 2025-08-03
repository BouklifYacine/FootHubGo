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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Presence,
  StatsJoueur,
} from "@/features/evenements/types/TypesEvenements";
import { ModalButtonAddPlayerStats } from "../../statsjoueur/components/ModalButtonAddPlayerStats";
import { Button } from "@/components/ui/button";

interface Props {
  presences: Presence[] | undefined;
  statsteamid: {
    idstatsequipe: string | undefined;
    eventid: string;
  };
  statsJoueur: StatsJoueur[] | undefined;
}

function ArrayPlayerStatusEventId({
  presences,
  statsteamid,
  statsJoueur,
}: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeadCell className="p-4">
            <Checkbox />
          </TableHeadCell>
          <TableHeadCell>Avatar</TableHeadCell>
          <TableHeadCell>Nom</TableHeadCell>
          <TableHeadCell>Poste</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Actions</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className="divide-y">
        {presences?.map((m) => {
          // Vérifie si ce joueur a déjà une stat
          const hasStats = statsJoueur?.some(
            (s) => s.idUtilisateur === m.idUtilisateur
          );

          console.log(hasStats);
          return (
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
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300">
                    <span className="text-lg font-medium text-gray-700">
                      {m.nom?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>{m.nom}</TableCell>
              <TableCell>{m.poste || "ENTRAINEUR"}</TableCell>
              <TableCell>{m.statut}</TableCell>
              <TableCell>
                {statsteamid.idstatsequipe && m.poste ? (
                  hasStats ? (
                    <div className="flex gap-2">
<Button></Button>
<Button></Button>
                    </div>
                  ) : (
                    <ModalButtonAddPlayerStats
                      playerid={m.idUtilisateur}
                      eventid={statsteamid.eventid}
                    />
                  )
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default ArrayPlayerStatusEventId;
