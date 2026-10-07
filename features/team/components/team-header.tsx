"use client";

import { useState } from "react";
import { KeyRound, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { teamLevelLabels } from "@/lib/enum-labels";
import type { MyTeam } from "../hooks/use-my-team";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { InitialsAvatar } from "./initials-avatar";
import { InviteCodeDialog } from "./invite-code-dialog";
import { TeamFormDialog } from "./team-form-dialog";
import { formatInviteCode } from "../invite-code";

type OpenDialog = "invite" | "edit" | "delete" | null;

/** Top of the squad page: logo, name, counters and the coach's club menu. */
export function TeamHeader({ data }: { data: MyTeam }) {
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const { team, members, role } = data;
  if (!team) return null;

  const isCoach = role === "COACH";
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <div className="relative flex flex-col items-center p-5">
      {isCoach && (
        <div className="absolute top-5 right-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions du club">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions du club</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDialog("invite")}>
                <KeyRound className="mr-2 size-4" />
                Gérer le code d&apos;invitation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialog("edit")}>
                <Pencil className="mr-2 size-4" />
                Modifier le club
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDialog("delete")}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 size-4" />
                Supprimer le club
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <InitialsAvatar
        name={team.name}
        src={team.logoUrl}
        className="size-[100px] text-2xl md:size-[140px]"
      />
      <Badge className="mt-2 rounded-lg px-3 py-1 text-sm font-medium tracking-tighter md:text-lg">
        {team.name}
      </Badge>

      <div className="mt-6 flex gap-10">
        <Counter label="Membres" value={members.length} />
        <div className="flex flex-col items-center">
          <Badge className="rounded-xl px-3 py-1 text-xs md:text-sm">{teamLevelLabels[team.level]}</Badge>
          <p className="mt-1 text-sm font-light tracking-tighter md:text-lg">Niveau</p>
        </div>
        {team.inviteCode && <Counter label="Code" value={formatInviteCode(team.inviteCode)} mono />}
      </div>

      {team.description && (
        <p className="mt-4 max-w-md text-center text-sm text-gray-600 md:text-base dark:text-gray-400">
          {team.description}
        </p>
      )}

      {isCoach && (
        <>
          <InviteCodeDialog open={dialog === "invite"} onOpenChange={close} code={team.inviteCode} />
          <TeamFormDialog
            open={dialog === "edit"}
            onOpenChange={close}
            team={{
              name: team.name,
              description: team.description ?? "",
              level: team.level,
              visibility: team.visibility,
            }}
          />
          <DeleteTeamDialog open={dialog === "delete"} onOpenChange={close} />
        </>
      )}
    </div>
  );
}

function Counter({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <p className={mono ? "font-mono text-base font-bold md:text-xl" : "text-xl font-bold md:text-3xl"}>{value}</p>
      <p className="text-sm font-light tracking-tighter md:text-lg">{label}</p>
    </div>
  );
}
