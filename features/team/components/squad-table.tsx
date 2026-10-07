"use client";

import { useState } from "react";
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
import { clubRoleLabels, playerPositionLabels, teamRoleLabels, toOptions } from "@/lib/enum-labels";
import { removeMemberError, sectionRoleChangeError } from "@/features/clubs/rules";
import { useRefreshAll } from "@/features/clubs/hooks/use-refresh-all";
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
  const refreshAll = useRefreshAll();
  const { data: session } = authClient.useSession();
  const [memberToKick, setMemberToKick] = useState<MyTeamMember | null>(null);
  const isCoach = data.role === "COACH";
  const myClubRole = data.club?.role ?? "MEMBER";
  const leavesClub = data.sections.length <= 1;

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
  const leave = useActionMutation(leaveTeam, { onSuccess: () => refreshAll("/app") });

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
              // Same rules as the server actions (features/clubs/rules.ts): only show what is allowed.
              const me = { userId: session?.user.id ?? "", clubRole: myClubRole };
              const target = { userId: member.userId, clubRole: member.clubRole };
              const canChangeRole = sectionRoleChangeError(me, target) === null;
              const canKick =
                removeMemberError({ ...me, coachesSection: isCoach }, { ...target, sectionRole: member.role }) === null;
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <InitialsAvatar name={member.user.name} src={member.user.image} className="size-9" />
                  </TableCell>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        className={member.role === "COACH" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"}
                      >
                        {teamRoleLabels[member.role]}
                      </Badge>
                      {member.clubRole !== "MEMBER" && <Badge variant="outline">{clubRoleLabels[member.clubRole]}</Badge>}
                    </div>
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
                        {leavesClub ? "Quitter le club" : "Quitter la section"}
                      </Button>
                    ) : data.canManage ? (
                      <MemberActions
                        disabled={updateRole.isPending || updatePosition.isPending || kick.isPending}
                        onRoleChange={canChangeRole ? (role) => updateRole.mutate({ memberId: member.id, role }) : undefined}
                        onKick={canKick ? () => setMemberToKick(member) : undefined}
                        onPositionChange={(position) =>
                          updatePosition.mutate({ memberId: member.id, position })
                        }
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
            <AlertDialogTitle>Retirer ce membre de la section ?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{memberToKick?.user.name}</strong> sera immédiatement retiré de la section (et du club si
              c&apos;est sa seule section).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToKick && kick.mutate(memberToKick.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Retirer
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
  /** Omitted when the caller may not change this member's role (club OWNER / ADMIN only). */
  onRoleChange?: (role: "COACH" | "PLAYER") => void;
  onPositionChange: (position: PlayerPosition) => void;
  onKick?: () => void;
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
        {onRoleChange && (
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
        )}
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
        {onKick && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onKick}>
              <Trash2 className="mr-2 size-4" />
              Retirer de la section
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
