"use client";

import { useState } from "react";
import { Check, Handshake, Lock, Search } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { SectionTitle } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clubVisibilityLabels, sectionCategoryLabels, teamLevelLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { usePublicClubs, type PublicClub } from "@/features/team/hooks/use-public-teams";
import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import { JoinRequestDialog } from "./join-request-dialog";

/** Clubs a player without a club can apply to: one request per section. */
export function TeamDirectory() {
  const { data: clubs, isPending, error, refetch } = usePublicClubs();
  const { data: myRequests } = useMyJoinRequests();
  // Derived from the server, so the button state survives remounts and reloads.
  const pendingSectionIds = new Set(
    myRequests?.filter((request) => request.status === "PENDING").map((request) => request.teamId),
  );

  return (
    <section className="space-y-2" aria-labelledby="directory-title">
      <SectionTitle>
        <span id="directory-title">Clubs qui recrutent</span>
      </SectionTitle>
      {isPending ? (
        <LoadingState variant="cards" rows={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : clubs.length === 0 ? (
        <EmptyState icon={Search} title="Aucun club pour le moment" description="Aucun club public n'est encore inscrit." />
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
    <li className="space-y-3 rounded-xl border bg-card p-4">
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
          <li key={section.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
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
  // Why it can't be done is written out (no tooltip): touch screens have no hover.
  if (!acceptsRequests) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden /> Sur invitation du coach
      </span>
    );
  }
  if (requestPending) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-success">
        <Check className="size-3.5" aria-hidden /> Demande envoyée
      </span>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" aria-label={`Postuler : ${sectionName}`} onClick={() => setOpen(true)}>
        <Handshake /> Postuler
      </Button>
      {acceptsRequests && (
        <JoinRequestDialog mode="create" teamId={sectionId} sectionName={sectionName} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
