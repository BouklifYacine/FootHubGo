"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { regenerateInviteCode, removeInviteCode } from "../actions";
import type { MyTeam } from "../hooks/use-my-team";
import { formatInviteCode } from "../invite-code";
import { InviteShareButtons, useInviteLink } from "./invite-share";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string | null;
  /** A section of the club (club management page); omitted = the active section. */
  teamId?: string;
  sectionName?: string;
  /** "FC Démo · Seniors A", in the shared message. */
  teamLabel?: string;
};

const invalidate = [queryKeys.me.team, queryKeys.home, queryKeys.club.admin];

/** Invite players to ONE section: share the link (or the code), change or delete it. */
export function InviteCodeDialog({ open, onOpenChange, code, teamId, sectionName, teamLabel }: Props) {
  const confirm = useConfirm();
  const link = useInviteLink(code);
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
  const label = teamLabel ?? sectionName ?? "la section";

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Inviter des joueurs{sectionName ? ` : ${sectionName}` : ""}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {code
              ? "Partage le lien dans le groupe de l'équipe : tes joueurs rejoignent la section en un geste."
              : "Crée un lien d'invitation pour faire venir tes joueurs."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {code && link ? (
          <div className="space-y-4">
            <InviteShareButtons code={code} teamLabel={label} />
            <div className="space-y-1 rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Lien d&apos;invitation</p>
              <p className="font-mono text-sm break-all select-all">{link}</p>
              <p className="pt-1 text-xs text-muted-foreground">
                Ou le code à saisir dans l&apos;app : <span className="font-mono font-semibold text-foreground">{formatInviteCode(code)}</span>
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            variant={code ? "outline" : "default"}
            className="flex-1"
            onClick={async () => {
              const ok =
                !code ||
                (await confirm({
                  title: "Changer le lien d'invitation ?",
                  description: "L'ancien lien et l'ancien code ne marcheront plus.",
                  confirmLabel: "Changer",
                  destructive: false,
                }));
              if (ok) regenerate.mutate({ teamId });
            }}
            disabled={regenerate.isPending}
          >
            <RefreshCw /> {code ? "Changer le lien" : "Créer un lien"}
          </Button>
          {code && (
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                const ok = await confirm({
                  title: "Supprimer le lien d'invitation ?",
                  description: "Plus personne ne pourra rejoindre la section avec ce lien ou ce code.",
                  confirmLabel: "Supprimer",
                });
                if (ok) remove.mutate({ teamId });
              }}
              disabled={remove.isPending}
              aria-label="Supprimer le lien d'invitation"
            >
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
