"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clubVisibilityLabels, sectionCategoryLabels, teamLevelLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { usePublicClubs, type PublicClub } from "@/features/team/hooks/use-public-teams";
import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import { JoinRequestDialog } from "./join-request-dialog";

/** Clubs a player without a club can apply to: one request per section. */
export function TeamDirectory() {
  const { data: clubs, isPending, isError } = usePublicClubs();
  const { data: myRequests } = useMyJoinRequests();
  // Derived from the server, so the button state survives remounts and reloads.
  const pendingSectionIds = new Set(
    myRequests?.filter((request) => request.status === "PENDING").map((request) => request.teamId),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Liste des clubs</h2>
      {isPending ? (
        <p className="py-4 text-center">Chargement des clubs...</p>
      ) : isError ? (
        <p className="py-4 text-center text-red-500">Erreur lors du chargement des clubs.</p>
      ) : clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border bg-muted/10 p-8">
          <p className="text-lg font-medium text-muted-foreground">Aucun club trouvé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Il n&apos;y a actuellement aucun club inscrit sur la plateforme.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} pendingSectionIds={pendingSectionIds} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ClubCard({ club, pendingSectionIds }: { club: PublicClub; pendingSectionIds: Set<string> }) {
  const acceptsRequests = club.visibility === "PUBLIC";
  return (
    <li className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <InitialsAvatar name={club.name} src={club.logoUrl} className="size-10 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{club.name}</p>
          <p className="text-xs text-muted-foreground">
            {club._count.members} membre{club._count.members > 1 ? "s" : ""} · {clubVisibilityLabels[club.visibility]}
          </p>
        </div>
      </div>
      {club.description && <p className="text-sm text-muted-foreground">{club.description}</p>}
      <ul className="divide-y rounded-lg border">
        {club.sections.map((section) => (
          <li key={section.id} className="flex items-center justify-between gap-2 p-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{section.name}</p>
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                <Badge variant="outline">{sectionCategoryLabels[section.category]}</Badge>
                <span>{teamLevelLabels[section.level]}</span>
                <span>· {section._count.members} membre{section._count.members > 1 ? "s" : ""}</span>
              </div>
            </div>
            <ApplyButton
              sectionId={section.id}
              sectionName={section.name}
              acceptsRequests={acceptsRequests}
              requestPending={pendingSectionIds.has(section.id)}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}

function ApplyButton({
  sectionId,
  sectionName,
  acceptsRequests,
  requestPending,
}: {
  sectionId: string;
  sectionName: string;
  acceptsRequests: boolean;
  requestPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = !acceptsRequests ? "Sur invitation" : requestPending ? "Demande envoyée" : "Postuler";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label={`${label} : ${sectionName}`}
        disabled={!acceptsRequests || requestPending}
        onClick={() => setOpen(true)}
      >
        <Handshake className="size-4" /> {label}
      </Button>
      {acceptsRequests && (
        <JoinRequestDialog mode="create" teamId={sectionId} sectionName={sectionName} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
