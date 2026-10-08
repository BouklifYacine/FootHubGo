"use client";

import { Check, UserPlus, X } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { playerPositionLabels, teamLevelLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { reviewJoinRequest } from "../actions";
import { useManagedJoinRequests } from "../hooks/use-managed-join-requests";
import type { TeamJoinRequest } from "../types";
import { RequestStatusBadge } from "./request-details";

/** Coach / club admin side: the join requests received by the sections they manage. */
export function TeamJoinRequests() {
  const { data: requests, isPending, error, refetch } = useManagedJoinRequests();
  const pending = requests?.filter((request) => request.status === "PENDING") ?? [];
  const done = requests?.filter((request) => request.status !== "PENDING") ?? [];

  return (
    <Page className="max-w-3xl">
      <PageHeader
        title="Demandes d'adhésion"
        description={
          pending.length > 0
            ? `${pending.length} demande${pending.length > 1 ? "s" : ""} en attente de ta réponse.`
            : "Les joueurs qui postulent dans tes sections apparaissent ici."
        }
      />
      {isPending ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !requests?.length ? (
        <EmptyState
          icon={UserPlus}
          title="Aucune demande pour le moment"
          description="Pour faire venir tes joueurs plus vite, partage plutôt le lien d'invitation depuis l'onglet Équipe."
          action={{ label: "Inviter des joueurs", href: "/app/squad?invite=1", icon: UserPlus }}
        />
      ) : (
        <>
          {pending.length > 0 && (
            <ul className="space-y-3">
              {pending.map((request) => (
                <TeamJoinRequestCard key={request.id} request={request} />
              ))}
            </ul>
          )}
          {done.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Déjà traitées</h2>
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {done.map((request) => (
                  <li key={request.id} className="flex items-center gap-3 px-4 py-3">
                    <InitialsAvatar name={request.user.name} src={request.user.image} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{request.user.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {request.team.name} · {formatDate(request.createdAt)}
                      </span>
                    </span>
                    <RequestStatusBadge status={request.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Page>
  );
}

function TeamJoinRequestCard({ request }: { request: TeamJoinRequest }) {
  const confirm = useConfirm();
  const review = useActionMutation(reviewJoinRequest, {
    invalidate: [queryKeys.club.all, queryKeys.me.team, queryKeys.home, queryKeys.me.badges],
    optimistic: {
      queryKey: queryKeys.club.joinRequests,
      update: (previous, { decision }) =>
        (previous as TeamJoinRequest[] | undefined)?.map((r) => (r.id === request.id ? { ...r, status: decision } : r)),
    },
  });

  return (
    <li className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <InitialsAvatar name={request.user.name} src={request.user.image} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{request.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {playerPositionLabels[request.position]} · {teamLevelLabels[request.level]}
          </p>
          <p className="text-xs text-muted-foreground">
            Pour {request.team.name} · {formatDate(request.createdAt)}
          </p>
        </div>
      </div>
      <p className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-line">{request.motivation}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={review.isPending}
          onClick={async () => {
            const ok = await confirm({
              title: `Refuser la demande de ${request.user.name} ?`,
              description: "Il sera prévenu. Il pourra postuler à nouveau plus tard.",
              confirmLabel: "Refuser",
            });
            if (ok) review.mutate({ requestId: request.id, decision: "REJECTED" });
          }}
        >
          <X /> Refuser
        </Button>
        <Button variant="success" disabled={review.isPending} onClick={() => review.mutate({ requestId: request.id, decision: "ACCEPTED" })}>
          <Check /> Accepter
        </Button>
      </div>
    </li>
  );
}
