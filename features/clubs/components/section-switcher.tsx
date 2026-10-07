"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Fan, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { sectionCategoryLabels, teamRoleLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { switchSection } from "../actions";
import { useRefreshAll } from "../hooks/use-refresh-all";

/**
 * Sidebar header: "Club · Section" of the active section, and a menu to switch to another of the
 * user's sections (stored in a cookie, every page reloads its data) or open the club management.
 */
export function SectionSwitcher() {
  const { data } = useMyTeam();
  const { isMobile, setOpenMobile } = useSidebar();
  const refreshAll = useRefreshAll();
  const switchTo = useActionMutation(switchSection, { onSuccess: () => refreshAll() });

  if (!data?.club || !data.team) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/">
              <Fan className="size-4" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">FootHubGo</span>
                <span className="truncate text-xs">Sans club</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const { club, team, sections } = data;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label="Changer de section"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <InitialsAvatar name={club.name} src={club.logoUrl} className="size-8 text-xs" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{club.name}</span>
                <span className="truncate text-xs">{team.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Mes sections · {club.name}</DropdownMenuLabel>
            {sections.map((section) => (
              <DropdownMenuItem
                key={section.teamId}
                disabled={switchTo.isPending}
                onClick={() => {
                  if (section.isActive) return;
                  switchTo.mutate(section.teamId);
                  setOpenMobile(false);
                }}
                className="gap-2"
              >
                <div className="grid flex-1 leading-tight">
                  <span className="truncate">{section.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {sectionCategoryLabels[section.category]} · {teamRoleLabels[section.role]}
                  </span>
                </div>
                {section.isActive && <Check className="size-4" aria-label="Section active" />}
              </DropdownMenuItem>
            ))}
            {club.isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/club" onClick={() => setOpenMobile(false)}>
                    <Settings className="size-4" /> Gérer le club
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
