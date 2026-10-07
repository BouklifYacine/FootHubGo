"use client";

import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { regenerateInviteCode, removeInviteCode } from "../actions";
import type { MyTeam } from "../hooks/use-my-team";
import { formatInviteCode } from "../invite-code";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string | null;
  /** A section of the club (club management page); omitted = the active section. */
  teamId?: string;
  sectionName?: string;
};

const invalidate = [queryKeys.me.team, queryKeys.home, queryKeys.club.admin];

/** The invite code of ONE section: whoever types it joins that section (and the club). */
export function InviteCodeDialog({ open, onOpenChange, code, teamId, sectionName }: Props) {
  const [copied, setCopied] = useState(false);
  const regenerate = useActionMutation(regenerateInviteCode, { invalidate });
  const remove = useActionMutation(removeInviteCode, {
    invalidate,
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous) => {
        const data = previous as MyTeam | undefined;
        return data?.team ? { ...data, team: { ...data.team, inviteCode: null } } : data;
      },
    },
  });

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(formatInviteCode(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Code d&apos;invitation{sectionName ? ` : ${sectionName}` : " de la section"}</DialogTitle>
          <DialogDescription>
            {code
              ? "Partagez ce code : il fait rejoindre cette section (et le club)."
              : "Générez un code d'invitation pour agrandir votre section !"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {code && (
            <div className="flex items-center gap-2">
              <span className="flex-1 rounded-lg border px-4 py-2 text-center font-mono text-xl tracking-wider sm:text-2xl">
                {formatInviteCode(code)}
              </span>
              <Button variant="outline" size="icon" onClick={copy} aria-label="Copier le code">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button
              className="flex-1"
              onClick={() => regenerate.mutate({ teamId })}
              disabled={regenerate.isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              {code ? "Changer le code" : "Créer un code"}
            </Button>
            {code && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => remove.mutate({ teamId })}
                disabled={remove.isPending}
                aria-label="Supprimer le code"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
