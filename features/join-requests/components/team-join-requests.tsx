"use client";

import { Check, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { playerPositionLabels, teamLevelLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { reviewJoinRequest } from "../actions";
import { useTeamJoinRequests } from "../hooks/use-team-join-requests";
import type { TeamJoinRequest } from "../types";
import { EmptyRequests, RequestDetails, RequestStatusBadge } from "./request-details";

/** Coach side: the join requests received by the team. */
export function TeamJoinRequests({ teamId }: { teamId: string }) {
  const { data: requests, isPending } = useTeamJoinRequests(teamId);
  const pendingCount = requests?.filter((request) => request.status === "PENDING").length ?? 0;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 md:mx-0 md:px-0">
      <h1 className="text-2xl font-bold tracking-tight">Candidatures reçues</h1>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Clock className="size-4 text-amber-500" />
          {pendingCount} demande(s) en attente
        </div>
      )}
      {isPending ? (
        <Loader2 className="animate-spin text-zinc-400" />
      ) : !requests?.length ? (
        <EmptyRequests text="Vous n'avez reçu aucune demande d'adhésion pour le moment." />
      ) : (
        requests.map((request) => <TeamJoinRequestCard key={request.id} teamId={teamId} request={request} />)
      )}
    </section>
  );
}

function TeamJoinRequestCard({ teamId, request }: { teamId: string; request: TeamJoinRequest }) {
  const isPending = request.status === "PENDING";

  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-zinc-900",
        isPending ? "border-amber-200 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-800/50" : "opacity-70",
      )}
    >
      <div className="flex items-center gap-5">
        <InitialsAvatar name={request.user.name} src={request.user.image} />
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold tracking-tight group-hover:text-primary">{request.user.name}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-semibold tracking-wider text-zinc-500 uppercase dark:bg-zinc-800">
              {playerPositionLabels[request.position]}
            </span>
            <span className="text-zinc-400">Niveau : {teamLevelLabels[request.level]}</span>
            <span className="text-zinc-400">{new Date(request.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RequestStatusBadge status={request.status} className="hidden sm:flex" />
        {isPending && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  Voir
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden p-0 sm:max-w-[400px]">
                <div className="flex flex-col items-center border-b bg-zinc-50/50 p-8 text-center dark:bg-zinc-900/50">
                  <InitialsAvatar name={request.user.name} src={request.user.image} className="mb-4 size-16" />
                  <DialogTitle className="text-2xl font-black tracking-tight uppercase">{request.user.name}</DialogTitle>
                  <p className="mt-1 text-sm font-medium text-zinc-500">Demande d&apos;adhésion</p>
                </div>
                <RequestDetails request={request} motivationLabel="Motivation" />
                <div className="flex justify-center pb-8">
                  <ReviewButtons teamId={teamId} requestId={request.id} />
                </div>
              </DialogContent>
            </Dialog>
            <ReviewButtons teamId={teamId} requestId={request.id} />
          </>
        )}
      </div>
    </div>
  );
}

function ReviewButtons({ teamId, requestId }: { teamId: string; requestId: string }) {
  const review = useActionMutation(reviewJoinRequest, {
    invalidate: [queryKeys.teams.joinRequests(teamId), queryKeys.me.team, queryKeys.home],
    optimistic: {
      queryKey: queryKeys.teams.joinRequests(teamId),
      update: (previous, { decision }) =>
        (previous as TeamJoinRequest[] | undefined)?.map((r) =>
          r.id === requestId ? { ...r, status: decision } : r,
        ),
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Accepter"
        className="size-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
        onClick={() => review.mutate({ requestId, decision: "ACCEPTED" })}
        disabled={review.isPending}
      >
        <Check className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Refuser"
        className="size-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => review.mutate({ requestId, decision: "REJECTED" })}
        disabled={review.isPending}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
