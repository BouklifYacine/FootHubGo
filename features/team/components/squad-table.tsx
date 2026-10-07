"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, LogOut, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { playerPositionLabels, teamRoleLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { PlayerPosition } from "@/generated/prisma/browser";
import {
  leaveTeam,
  removeMember,
  updateMemberPosition,
  updateMemberRole,
} from "../actions";
import type { MyTeam, MyTeamMember } from "../hooks/use-my-team";
import { InitialsAvatar } from "./initials-avatar";

const positionOptions = toOptions(playerPositionLabels);

/** Optimistic update of the cached `me.team` query: patch (or remove, when null) one member. */
function patchMember(previous: unknown, memberId: string, patch: (m: MyTeamMember) => MyTeamMember | null) {
  const data = previous as MyTeam | undefined;
  if (!data) return data;
  return { ...data, members: data.members.flatMap((m) => (m.id === memberId ? (patch(m) ?? []) : [m])) };
}

export function SquadTable({ data }: { data: MyTeam }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [memberToKick, setMemberToKick] = useState<MyTeamMember | null>(null);
  const isCoach = data.role === "COACH";

  const updateRole = useActionMutation(updateMemberRole, {
    invalidate: [queryKeys.me.team],
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous, { memberId, role }) => patchMember(previous, memberId, (m) => ({ ...m, role })),
    },
  });
  const updatePosition = useActionMutation(updateMemberPosition, {
    invalidate: [queryKeys.me.team],
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous, { memberId, position }) =>
        patchMember(previous, memberId, (m) => ({ ...m, position })),
    },
  });
  const kick = useActionMutation(removeMember, {
    invalidate: [queryKeys.me.team, queryKeys.home],
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous, memberId) => patchMember(previous, memberId, () => null),
    },
  });
  const leave = useActionMutation(leaveTeam, {
    invalidate: [queryKeys.me.all, queryKeys.home, queryKeys.teams.all],
    onSuccess: () => router.push("/app"),
  });

  if (data.members.length === 0) return <p>Pas de joueurs dans l&apos;effectif</p>;

  return (
    <>
      <div className="mt-10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Blessé</TableHead>
              <TableHead>Licencié</TableHead>
              <TableHead>Arrivé le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.map((member) => {
              const isMe = member.userId === session?.user.id;
              const isLicensed = member.role === "COACH" || member.isLicensed;
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <InitialsAvatar name={member.user.name} src={member.user.image} className="size-9" />
                  </TableCell>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={member.role === "COACH" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"}
                    >
                      {teamRoleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.position ? playerPositionLabels[member.position] : "Sans poste"}</TableCell>
                  <TableCell>
                    <StatusBadge ok={!member.isInjured} label={member.isInjured ? "Oui" : "Non"} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge ok={isLicensed} label={isLicensed ? "Oui" : "Non"} />
                  </TableCell>
                  <TableCell>{new Date(member.joinedAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {isMe ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => leave.mutate()}
                        disabled={leave.isPending}
                      >
                        <LogOut className="size-4" />
                        Quitter le club
                      </Button>
                    ) : isCoach && member.role !== "COACH" ? (
                      <MemberActions
                        disabled={updateRole.isPending || updatePosition.isPending || kick.isPending}
                        onRoleChange={(role) => updateRole.mutate({ memberId: member.id, role })}
                        onPositionChange={(position) =>
                          updatePosition.mutate({ memberId: member.id, position })
                        }
                        onKick={() => setMemberToKick(member)}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!memberToKick} onOpenChange={(open) => !open && setMemberToKick(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclure ce joueur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir exclure <strong>{memberToKick?.user.name}</strong> du club ? Le
              joueur sera immédiatement retiré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToKick && kick.mutate(memberToKick.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Exclure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge
      className={`rounded-md border ${
        ok ? "border-emerald-800 bg-emerald-100 text-emerald-800" : "border-red-800 bg-red-200 text-red-800"
      }`}
    >
      {ok ? <CircleCheck size={16} className="mr-1" /> : <CircleX size={16} className="mr-1" />}
      {label}
    </Badge>
  );
}

type MemberActionsProps = {
  disabled: boolean;
  onRoleChange: (role: "COACH" | "PLAYER") => void;
  onPositionChange: (position: PlayerPosition) => void;
  onKick: () => void;
};

function MemberActions({ disabled, onRoleChange, onPositionChange, onKick }: MemberActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" disabled={disabled} aria-label="Actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil className="mr-2 size-4" />
            Modifier le rôle
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onRoleChange("PLAYER")}>Joueur</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("COACH")}>Entraîneur</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil className="mr-2 size-4" />
            Modifier le poste
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {positionOptions.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => onPositionChange(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onKick}>
          <Trash2 className="mr-2 size-4" />
          Exclure du club
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
