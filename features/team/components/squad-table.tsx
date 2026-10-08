"use client";

import { useState } from "react";
import { CircleAlert, MoreVertical, UserMinus } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { formatNumericDate } from "@/lib/format";
import { clubRoleLabels, playerPositionLabels, teamRoleLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { removeMemberError, sectionRoleChangeError } from "@/features/clubs/rules";
import type { PlayerPosition } from "@/generated/prisma/browser";
import { removeMember, updateMemberPosition, updateMemberRole } from "../actions";
import type { MyTeam, MyTeamMember } from "../hooks/use-my-team";
import { InitialsAvatar } from "./initials-avatar";

const positionOptions = toOptions(playerPositionLabels);

/** Optimistic update of the cached `me.team` query: patch (or remove, when null) one member. */
function patchMember(previous: unknown, memberId: string, patch: (m: MyTeamMember) => MyTeamMember | null) {
  const data = previous as MyTeam | undefined;
  if (!data) return data;
  return { ...data, members: data.members.flatMap((m) => (m.id === memberId ? (patch(m) ?? []) : [m])) };
}

/** Status chips, icon + text, only for what deserves attention (injured, not licensed). */
function MemberStatus({ member }: { member: MyTeamMember }) {
  const isLicensed = member.role === "COACH" || member.isLicensed;
  return (
    <>
      {member.isInjured && (
        <Badge variant="danger">
          <CircleAlert aria-hidden /> Blessé
        </Badge>
      )}
      {!isLicensed && <Badge variant="muted">Non licencié</Badge>}
    </>
  );
}

function RoleBadges({ member }: { member: MyTeamMember }) {
  return (
    <>
      {member.role === "COACH" && <Badge variant="info">{teamRoleLabels.COACH}</Badge>}
      {member.clubRole !== "MEMBER" && <Badge variant="outline">{clubRoleLabels[member.clubRole]}</Badge>}
    </>
  );
}

/**
 * The squad: a list of member cards on phones, a table on md+. Managers open a member's actions
 * (role, position, remove) in a sheet: no sub-menus.
 */
export function SquadTable({ data }: { data: MyTeam }) {
  const { data: session } = authClient.useSession();
  // An id, so the sheet shows the live (optimistically updated) member.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.members.find((member) => member.id === selectedId);
  const myId = session?.user.id;

  const actionsButton = (member: MyTeamMember) =>
    data.canManage && member.userId !== myId ? (
      <Button variant="ghost" size="icon" aria-label={`Actions pour ${member.user.name}`} onClick={() => setSelectedId(member.id)}>
        <MoreVertical />
      </Button>
    ) : null;

  const coaches = data.members.filter((member) => member.role === "COACH");
  const players = data.members.filter((member) => member.role === "PLAYER");

  return (
    <>
      <div className="space-y-4 md:hidden">
        {[
          { title: coaches.length > 1 ? "Entraîneurs" : "Entraîneur", members: coaches },
          { title: `Joueurs (${players.length})`, members: players },
        ].map(
          (group) =>
            group.members.length > 0 && (
              <section key={group.title} className="space-y-2">
                <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</h2>
                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                  {group.members.map((member) => (
                    <li key={member.id} className="flex items-center gap-3 px-4 py-2.5">
                      <InitialsAvatar name={member.user.name} src={member.user.image} className="size-10" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {member.user.name}
                          {member.userId === myId && <span className="text-muted-foreground"> (toi)</span>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.position ? playerPositionLabels[member.position] : "Poste non renseigné"}
                        </p>
                        <div className="flex flex-wrap gap-1 empty:hidden">
                          <RoleBadges member={member} />
                          <MemberStatus member={member} />
                        </div>
                      </div>
                      {actionsButton(member)}
                    </li>
                  ))}
                </ul>
              </section>
            ),
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Arrivé le</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={member.user.name} src={member.user.image} className="size-9" />
                    <span className="font-medium">
                      {member.user.name}
                      {member.userId === myId && <span className="text-muted-foreground"> (toi)</span>}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.role === "PLAYER" && <span className="text-sm">{teamRoleLabels.PLAYER}</span>}
                    <RoleBadges member={member} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.position ? playerPositionLabels[member.position] : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <MemberStatus member={member} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatNumericDate(member.joinedAt)}</TableCell>
                <TableCell>{actionsButton(member)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && <MemberActionsDialog data={data} member={selected} onClose={() => setSelectedId(null)} />}
    </>
  );
}

/** A member's actions, allowed by the same rules as the server actions (features/clubs/rules.ts). */
function MemberActionsDialog({ data, member, onClose }: { data: MyTeam; member: MyTeamMember; onClose: () => void }) {
  const { data: session } = authClient.useSession();
  const confirm = useConfirm();
  const me = { userId: session?.user.id ?? "", clubRole: data.club?.role ?? "MEMBER" };
  const target = { userId: member.userId, clubRole: member.clubRole };
  const canChangeRole = sectionRoleChangeError(me, target) === null;
  const canRemove =
    removeMemberError({ ...me, coachesSection: data.role === "COACH" }, { ...target, sectionRole: member.role }) === null;

  const options = { invalidate: [queryKeys.me.team, queryKeys.home] };
  const updateRole = useActionMutation(updateMemberRole, {
    ...options,
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous, { memberId, role }) => patchMember(previous, memberId, (m) => ({ ...m, role })),
    },
  });
  const updatePosition = useActionMutation(updateMemberPosition, {
    ...options,
    optimistic: {
      queryKey: queryKeys.me.team,
      update: (previous, { memberId, position }) => patchMember(previous, memberId, (m) => ({ ...m, position })),
    },
  });
  const remove = useActionMutation(removeMember, {
    ...options,
    onSuccess: onClose,
    optimistic: { queryKey: queryKeys.me.team, update: (previous, memberId) => patchMember(previous, memberId, () => null) },
  });

  return (
    <ResponsiveDialog open onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{member.user.name}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>Rôle et poste dans la section.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          {canChangeRole && (
            <div className="space-y-2">
              <Label htmlFor="member-role">Rôle</Label>
              <Select
                value={member.role}
                onValueChange={(role) => updateRole.mutate({ memberId: member.id, role: role as "COACH" | "PLAYER" })}
              >
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAYER">{teamRoleLabels.PLAYER}</SelectItem>
                  <SelectItem value="COACH">{teamRoleLabels.COACH}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="member-position">Poste</Label>
            <Select
              value={member.position ?? undefined}
              onValueChange={(position) => updatePosition.mutate({ memberId: member.id, position: position as PlayerPosition })}
            >
              <SelectTrigger id="member-position" className="w-full">
                <SelectValue placeholder="Choisir un poste" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canRemove && (
            <Button
              variant="outline"
              className="w-full text-destructive"
              disabled={remove.isPending}
              onClick={async () => {
                const ok = await confirm({
                  title: `Retirer ${member.user.name} de la section ?`,
                  description: "Il est retiré tout de suite (et du club si c'est sa seule section). Il sera prévenu.",
                  confirmLabel: "Retirer",
                });
                if (ok) remove.mutate(member.id);
              }}
            >
              <UserMinus /> Retirer de la section
            </Button>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
