"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { teamLevelLabels, teamVisibilityLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { usePublicTeams, type PublicTeam } from "@/features/team/hooks/use-public-teams";
import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import { JoinRequestDialog } from "./join-request-dialog";

/** List of the clubs a player without a team can apply to. */
export function TeamDirectory() {
  const { data: teams, isPending, isError } = usePublicTeams();
  const { data: myRequests } = useMyJoinRequests();
  // Derived from the server, so the button state survives remounts and reloads.
  const pendingTeamIds = new Set(
    myRequests?.filter((request) => request.status === "PENDING").map((request) => request.teamId),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Liste des clubs</h2>
      {isPending ? (
        <p className="py-4 text-center">Chargement des clubs...</p>
      ) : isError ? (
        <p className="py-4 text-center text-red-500">Erreur lors du chargement des clubs.</p>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border bg-muted/10 p-8">
          <p className="text-lg font-medium text-muted-foreground">Aucun club trouvé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Il n&apos;y a actuellement aucun club inscrit sur la plateforme.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Club</TableHead>
                <TableHead className="font-bold">Niveau</TableHead>
                <TableHead className="text-center font-bold">Membres</TableHead>
                <TableHead className="font-bold">Recrutement</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <InitialsAvatar name={team.name} src={team.logoUrl} className="size-8 text-xs" />
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{teamLevelLabels[team.level]}</TableCell>
                  <TableCell className="text-center">{team._count.members}</TableCell>
                  <TableCell>{teamVisibilityLabels[team.visibility]}</TableCell>
                  <TableCell className="text-right">
                    <JoinTeamButton team={team} requestPending={pendingTeamIds.has(team.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function JoinTeamButton({ team, requestPending }: { team: PublicTeam; requestPending: boolean }) {
  const [open, setOpen] = useState(false);
  const acceptsRequests = team.visibility === "PUBLIC";
  const tooltip = !acceptsRequests
    ? "Ce club recrute uniquement sur invitation"
    : requestPending
      ? "Demande en attente pour ce club"
      : "Faire une demande pour rejoindre ce club";

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span: a disabled button does not fire the hover events the tooltip needs */}
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                aria-label={tooltip}
                disabled={!acceptsRequests || requestPending}
                onClick={() => setOpen(true)}
              >
                <Handshake className="size-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1 text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {acceptsRequests && (
        <JoinRequestDialog mode="create" teamId={team.id} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
