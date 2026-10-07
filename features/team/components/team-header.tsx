"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, MoreVertical, Settings } from "lucide-react";
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
import { sectionCategoryLabels, teamLevelLabels } from "@/lib/enum-labels";
import type { MyTeam } from "../hooks/use-my-team";
import { InitialsAvatar } from "./initials-avatar";
import { InviteCodeDialog } from "./invite-code-dialog";
import { formatInviteCode } from "../invite-code";

/**
 * Top of the squad page: club logo, "Club · Section", counters, and the section menu (invite code
 * for the section's coaches and the club admins, link to the club management page for OWNER / ADMIN).
 */
export function TeamHeader({ data }: { data: MyTeam }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { team, members, canManage, club } = data;
  if (!team) return null;

  const isClubAdmin = club?.isAdmin ?? false;

  return (
    <div className="relative flex flex-col items-center p-5">
      {canManage && (
        <div className="absolute top-5 right-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions de la section">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Section {team.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                <KeyRound className="mr-2 size-4" />
                Gérer le code d&apos;invitation
              </DropdownMenuItem>
              {isClubAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/app/club">
                    <Settings className="mr-2 size-4" />
                    Gérer le club
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <InitialsAvatar
        name={club?.name ?? team.name}
        src={team.logoUrl}
        className="size-[100px] text-2xl md:size-[140px]"
      />
      <Badge className="mt-2 rounded-lg px-3 py-1 text-sm font-medium tracking-tighter md:text-lg">
        {team.displayName}
      </Badge>
      <p className="mt-1 text-xs text-muted-foreground">{sectionCategoryLabels[team.category]}</p>

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

      {canManage && (
        <InviteCodeDialog open={inviteOpen} onOpenChange={setInviteOpen} code={team.inviteCode} sectionName={team.name} />
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
