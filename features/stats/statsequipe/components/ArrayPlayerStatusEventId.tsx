import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { UseTeamList } from "@/features/CallUp/hooks/UseTeamList";
import {
  Presence,
  StatsJoueur,
} from "@/features/evenements/types/TypesEvenements";
import { CircleCheck, CircleX, Send } from "lucide-react";

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
  const { data, isPending } = useInfosClub();
  const TeamId = data?.equipe.id;
  const { data: TeamListData, isPending: isPendingTeamList } =
    UseTeamList(TeamId);

  const entraineur = data?.role === "ENTRAINEUR";

  if (isPending || isPendingTeamList) {
    return <div>Chargement des membres...</div>;
  }

  if (!TeamListData?.equipe?.membres?.length) {
    return <div>Aucun membre à afficher</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead className="text-black dark:text-white">Avatar</TableHead>
          <TableHead className="text-black dark:text-white">Nom</TableHead>
          <TableHead className="text-black dark:text-white">Poste</TableHead>
          <TableHead className="text-black dark:text-white">Licencié</TableHead>
          <TableHead className="text-black dark:text-white">Blessé</TableHead>
          {entraineur && (
            <TableHead className="text-black dark:text-white">Action</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {TeamListData.equipe.membres.map((m) => (
          <TableRow key={m.id}>
            <TableCell></TableCell>
            <TableCell>
              {m.image ? (
                <Image
                  src={m.image}
                  width={35}
                  height={35}
                  alt={m.name}
                  className="rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300">
                  <span className="text-lg font-medium ">
                    {m.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-black dark:text-white">
              {m.name}
            </TableCell>
            <TableCell className="text-black dark:text-white">
              {m.position || "ENTRAINEUR"}
            </TableCell>
            <TableCell>
              <Badge
                className={`rounded-md border text-md inline-flex items-center gap-1 px-2 py-1 ${
                  m.isLicensed
                    ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                    : "border-red-800 bg-red-200 text-red-800"
                }`}
              >
                {m.isLicensed ? (
                  <CircleCheck size={16} />
                ) : (
                  <CircleX size={16} />
                )}
                {m.isLicensed ? "Oui" : "Non"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={`rounded-md border text-md inline-flex items-center gap-1 px-2 py-1 ${
                  m.isBlessed
                    ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                    : "border-red-800 bg-red-200 text-red-800"
                }`}
              >
                {m.isBlessed ? (
                  <CircleX size={16} />
                ) : (
                  <CircleCheck size={16} />
                )}
                {m.isBlessed ? "Oui" : "Non"}
              </Badge>
            </TableCell>
            {entraineur && (
              <TableCell>
                {m.position !== "ENTRAINEUR" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={m.isBlessed}
                        className="cursor-pointer hover:opacity-80 border border-gray-400 d rounded-lg"
                      >
                        <Send />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Envoyez une convocation au joueur</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ArrayPlayerStatusEventId;
