"use client";

import { StatsJoueur } from "@/features/evenements/types/TypesEvenements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 

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
  if (note <= 5) return "bg-red-600";
  else if (note <= 6) return "bg-orange-500";
  else if (note <= 7) return "bg-green-400";
  else return "bg-green-500";
};

function ArrayPlayerStatsEventsId({ statsJoueur, eventId }: Props) {
  const { mutate, isPending } = useSupprimerStatsJoueur();
  const { data } = useInfosClub();
  const entraineur = data?.role === "ENTRAINEUR";

  const DeletePlayerStats = (playerId: string, statisticId: string) => {
    mutate({ eventId, joueurid: playerId, statistiqueid: statisticId });
  };

  if (!statsJoueur || statsJoueur.length === 0)
    return <p className="p-4 text-center">Aucune statistique joueur disponible.</p>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-4">
              <Checkbox />
            </TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Buts</TableHead>
            <TableHead>Passes décisive</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Titulaire</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Minutes jouées</TableHead>
            {entraineur && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {statsJoueur.map((m) => (
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
              <TableCell>{m.nom}</TableCell>
              <TableCell>{m.buts}</TableCell>
              <TableCell>{m.passesdecisive}</TableCell>
              <TableCell>{m.poste || "Sans poste"}</TableCell>
              <TableCell>
                <Badge
                  className={`rounded-md border text-md ${
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
              <TableCell>
                <div
                  className={`border rounded-md flex items-center justify-center w-10 ${BadgeNote(
                    m.note
                  )}`}
                >
                  <p className="text-white">{m.note}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="bg-gray-700 dark:bg-black border rounded-md flex items-center justify-center w-10">
                  <p className="text-white">{m.minutesJouees}</p>
                </div>
              </TableCell>
              {entraineur && (
                <TableCell>
                  <div className="flex gap-2">
                    <ModalButtonEditPlayerStats eventid={eventId} joueur={m} />
                    <BoutonSupprimer
                      supprimer={() => DeletePlayerStats(m.idUtilisateur, m.id)}
                      disabled={isPending}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ArrayPlayerStatsEventsId;
