"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Send, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { LoadingState } from "@/components/app/loading-state";
import { SectionTitle } from "@/components/app/page-header";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { teamLevelLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { cancelJoinRequest } from "../actions";
import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import type { MyJoinRequest } from "../types";
import { JoinRequestDialog } from "./join-request-dialog";
import { RequestDetails, RequestStatusBadge } from "./request-details";

/**
 * Player side: the join requests I sent. `compact` (home without a club): only shown when there
 * are requests.
 */
export function MyJoinRequests({ compact }: { compact?: boolean }) {
  const { data: requests, isPending } = useMyJoinRequests();
  if (compact && !requests?.length) return null;

  return (
    <section className="space-y-2" aria-labelledby="my-requests-title">
      <SectionTitle>
        <span id="my-requests-title">Mes demandes</span>
      </SectionTitle>
      {isPending ? (
        <LoadingState rows={1} />
      ) : !requests?.length ? (
        <EmptyState icon={Send} title="Aucune demande envoyée" description="Postule dans une section ci-dessous : ses coachs te répondront." />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {requests.map((request) => (
            <MyJoinRequestRow key={request.id} request={request} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MyJoinRequestRow({ request }: { request: MyJoinRequest }) {
  const [dialog, setDialog] = useState<"details" | "edit" | null>(null);
  const confirm = useConfirm();
  const cancel = useActionMutation(cancelJoinRequest, {
    invalidate: [queryKeys.me.joinRequests],
    optimistic: {
      queryKey: queryKeys.me.joinRequests,
      update: (previous, requestId) => (previous as MyJoinRequest[] | undefined)?.filter((r) => r.id !== requestId),
    },
  });
  const isPending = request.status === "PENDING";
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <InitialsAvatar name={request.team.name} src={request.team.logoUrl} className="size-10" />
      <button type="button" className="min-w-0 flex-1 text-left outline-none focus-visible:underline" onClick={() => setDialog("details")}>
        <span className="block truncate text-sm font-medium">{request.team.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {teamLevelLabels[request.team.level]} · {formatDate(request.createdAt)}
        </span>
      </button>
      <RequestStatusBadge status={request.status} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions sur la demande à ${request.team.name}`}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setDialog("details")}>Voir la demande</DropdownMenuItem>
          {isPending && (
            <>
              <DropdownMenuItem onClick={() => setDialog("edit")}>
                <Pencil /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={cancel.isPending}
                onClick={async () => {
                  const ok = await confirm({
                    title: "Supprimer ta demande ?",
                    description: `Elle est retirée de ${request.team.name}. Tu pourras postuler à nouveau.`,
                    confirmLabel: "Supprimer",
                  });
                  if (ok) cancel.mutate(request.id);
                }}
              >
                <Trash2 /> Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResponsiveDialog open={dialog === "details"} onOpenChange={close}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{request.team.name}</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <RequestStatusBadge status={request.status} className="w-fit" />
          <RequestDetails request={request} motivationLabel="Ton message au coach" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {isPending && (
        <JoinRequestDialog
          mode="edit"
          open={dialog === "edit"}
          onOpenChange={close}
          requestId={request.id}
          defaultValues={{ position: request.position, level: request.level, motivation: request.motivation }}
        />
      )}
    </li>
  );
}
