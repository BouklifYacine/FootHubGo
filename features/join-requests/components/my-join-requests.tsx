"use client";

import { useState } from "react";
import { Eye, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { teamLevelLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { cancelJoinRequest } from "../actions";
import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import type { MyJoinRequest } from "../types";
import { JoinRequestDialog } from "./join-request-dialog";
import { EmptyRequests, RequestDetails, RequestStatusBadge } from "./request-details";

/** Player side: the join requests I sent. */
export function MyJoinRequests() {
  const { data: requests, isPending } = useMyJoinRequests();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 md:mx-0 md:px-0">
      <h1 className="text-2xl font-bold tracking-tight">Vos demandes de transfert</h1>
      {isPending ? (
        <Loader2 className="animate-spin text-zinc-400" />
      ) : !requests?.length ? (
        <EmptyRequests text="Vous n'avez pas encore postulé dans un club." />
      ) : (
        requests.map((request) => <MyJoinRequestCard key={request.id} request={request} />)
      )}
    </section>
  );
}

function MyJoinRequestCard({ request }: { request: MyJoinRequest }) {
  const [dialog, setDialog] = useState<"details" | "edit" | null>(null);
  const cancel = useActionMutation(cancelJoinRequest, {
    invalidate: [queryKeys.me.joinRequests],
    optimistic: {
      queryKey: queryKeys.me.joinRequests,
      update: (previous, requestId) =>
        (previous as MyJoinRequest[] | undefined)?.filter((r) => r.id !== requestId),
    },
  });
  const isPending = request.status === "PENDING";
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <div className="group flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900">
      <div className="flex items-center gap-5">
        <InitialsAvatar name={request.team.name} src={request.team.logoUrl} />
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold tracking-tight group-hover:text-primary">{request.team.name}</p>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:bg-zinc-800">
              {teamLevelLabels[request.team.level]}
            </span>
            <span className="text-zinc-500">{new Date(request.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RequestStatusBadge status={request.status} className="hidden sm:flex" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Actions">
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialog("details")}>
              <Eye className="size-4" /> Voir la demande
            </DropdownMenuItem>
            {isPending && (
              <>
                <DropdownMenuItem onClick={() => setDialog("edit")}>
                  <Pencil className="size-4" /> Modifier la demande
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(request.id)}
                >
                  <Trash2 className="size-4" /> Supprimer la demande
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={dialog === "details"} onOpenChange={close}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[400px]">
          <div className="flex flex-col items-center border-b bg-zinc-50/50 p-8 text-center dark:bg-zinc-900/50">
            <InitialsAvatar name={request.team.name} src={request.team.logoUrl} className="mb-4 size-16" />
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">{request.team.name}</DialogTitle>
            <p className="mt-1 text-sm font-medium text-zinc-500">Dossier de candidature</p>
            <RequestStatusBadge status={request.status} className="mt-4" />
          </div>
          <RequestDetails request={request} motivationLabel="Message au coach" />
        </DialogContent>
      </Dialog>

      {isPending && (
        <JoinRequestDialog
          mode="edit"
          open={dialog === "edit"}
          onOpenChange={close}
          requestId={request.id}
          defaultValues={{ position: request.position, level: request.level, motivation: request.motivation }}
        />
      )}
    </div>
  );
}
