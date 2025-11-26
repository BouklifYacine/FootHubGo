import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { UseTeamList } from "@/features/CallUp/hooks/UseTeamList";
import { CircleCheck, CircleX } from "lucide-react";
import CallUpButton from "@/features/CallUp/components/CallUpButton";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import DeleteCallUpButton from "./DeleteCallUpButton";
import { ModalButtonAddPlayerStats } from "@/features/stats/statsjoueur/components/ModalButtonAddPlayerStats";
import { StatsJoueur } from "@/features/evenements/types/TypesEvenements";

interface Props {
    statsJoueur: StatsJoueur[] | undefined;
  statsteamid: {
    idstatsequipe: string | undefined;
    eventid: string;
    dateEvent : Date | undefined
  };
}

function ArrayPlayerStatusEventId({ statsteamid,statsJoueur }: Props) {
  const { data, isPending } = useInfosClub();
  const TeamId = data?.equipe.id;
  const eventId = statsteamid.eventid;
  const { data: TeamListData, isPending: isPendingTeamList } = UseTeamList(
    TeamId,
    eventId
  );
  
  const entraineur = data?.role === "ENTRAINEUR";

  if (isPending || isPendingTeamList) {
    return <div>Chargement des membres...</div>;
  }

  if (!TeamListData?.equipe?.membres?.length) {
    return <div>Aucun membre à afficher</div>;
  }

  const joueurs = TeamListData.equipe.membres.filter(
    (m) => m.position !== "ENTRAINEUR"
  );

  if (joueurs.length === 0) {
    return <p className="p-4 text-center">Aucun joueur à afficher</p>;
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
          <TableHead className="text-black dark:text-white">Convoqué</TableHead>
          <TableHead className="text-black dark:text-white">Statut</TableHead>
          <TableHead className="text-black dark:text-white">
            Date envoi
          </TableHead>
          <TableHead className="text-black dark:text-white">
            Date réponse
          </TableHead>
          {entraineur && (
            <TableHead className="text-black dark:text-white">Action</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {TeamListData.equipe.membres
          .filter((m) => m.position !== "ENTRAINEUR")
          .map((m) => {
            const convocation = m.convocations.find(
              (conv) => conv.evenementId === statsteamid.eventid
            );

            const isCalled = m.convocations.length > 0;

            const hasStats = statsJoueur?.some(stat => stat.idUtilisateur === m.id);

            return (
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
                  {m.poste || "Aucun"}
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
                      <CircleCheck size={16} />
                    ) : (
                      <CircleX size={16} />
                    )}
                    {m.isBlessed ? "Oui" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-md border text-md inline-flex items-center gap-1 px-2 py-1 ${
                      isCalled
                        ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                        : "border-red-800 bg-red-200 text-red-800"
                    }`}
                  >
                    {isCalled ? (
                      <CircleCheck size={16} />
                    ) : (
                      <CircleX size={16} />
                    )}
                    {isCalled ? "Oui" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {convocation ? (
                    <Badge
                      className={`rounded-md border text-md inline-flex items-center gap-1 px-2 py-1 ${
                        convocation.statut === "EN_ATTENTE"
                          ? "border-orange-500 bg-orange-100 text-orange-700"
                          : convocation.statut === "CONFIRME"
                            ? "border-green-500 bg-green-100 text-green-700"
                            : "border-red-500 bg-red-100 text-red-700"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          convocation.statut === "EN_ATTENTE"
                            ? "bg-orange-500"
                            : convocation.statut === "CONFIRME"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }`}
                      />
                      {convocation.statut === "EN_ATTENTE"
                        ? "En attente"
                        : convocation.statut === "CONFIRME"
                          ? "Confirmé"
                          : "Refusé"}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="text-black dark:text-white">
                  {convocation ? (
                    <span className="text-md">
                      {dayjs(convocation.dateEnvoi).format(
                        "DD/MM/YYYY à HH:mm"
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-black dark:text-white">
                  {convocation?.dateReponse ? (
                    <span className="text-xs">
                      {dayjs(convocation.dateReponse).format(
                        "DD/MM/YYYY à HH:mm"
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                {entraineur && (
                  <TableCell>
                    {m.position !== "ENTRAINEUR" && (
                      <div className="flex gap-2">
                        {isCalled ? (
                          ""
                        ) : (
                          <CallUpButton
                            injured={m.isBlessed}
                            playerId={m.id}
                            eventId={statsteamid.eventid}
                            teamId={TeamId}
                            isCalled={isCalled}
                          />
                        )}
                        {convocation && (
  <>
    {!hasStats && statsteamid.idstatsequipe && convocation.statut === "CONFIRME" && (
      <ModalButtonAddPlayerStats
        poste={m.poste}
        eventid={statsteamid.eventid}
        playerId={m.id}
      />
    ) }
    
    {dayjs().isBefore(dayjs(statsteamid.dateEvent)) && (
      <DeleteCallUpButton
        callUpId={convocation.id}
        eventId={statsteamid.eventid}
        teamId={TeamId!}
      />
    )}
  </>
)}

                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}

export default ArrayPlayerStatusEventId;
