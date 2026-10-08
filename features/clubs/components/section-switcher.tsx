"use client";

import Link from "next/link";
import { Check, ChevronDown, ChevronsUpDown, Fan, Settings } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { useMyTeam, type MyTeam } from "@/features/team/hooks/use-my-team";
import { switchSection } from "../actions";
import { useRefreshAll } from "../hooks/use-refresh-all";

/** The user's sections (switch = cookie + every query reloads) and the club management link. */
function SectionMenuContent({
  data,
  onDone,
  className,
  side,
  align = "start",
}: {
  data: MyTeam;
  onDone?: () => void;
  className?: string;
  side?: "bottom" | "right";
  align?: "start" | "center" | "end";
}) {
  const refreshAll = useRefreshAll();
  const switchTo = useActionMutation(switchSection, { onSuccess: () => refreshAll() });
  if (!data.club) return null;

  return (
    <DropdownMenuContent className={cn("min-w-64 rounded-lg", className)} align={align} side={side} sideOffset={4}>
      <DropdownMenuLabel className="text-xs text-muted-foreground">Mes sections · {data.club.name}</DropdownMenuLabel>
      {data.sections.map((section) => (
        <DropdownMenuItem
          key={section.teamId}
          disabled={switchTo.isPending}
          onClick={() => {
            onDone?.();
            if (!section.isActive) switchTo.mutate(section.teamId);
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
      {data.club.isAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/app/club" onClick={onDone}>
              <Settings className="size-4" /> Gérer le club
            </Link>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );
}

/**
 * Sidebar header (desktop): "Club · Section" of the active section and a menu to switch to
 * another of the user's sections or open the club management.
 */
export function SectionSwitcher() {
  const { data } = useMyTeam();
  const { isMobile, setOpenMobile } = useSidebar();

  if (!data?.club || !data.team) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/app">
              <Fan className="size-4" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">FootHubGo</span>
                <span className="truncate text-xs text-muted-foreground">Sans club</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const { club, team } = data;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label="Changer de section"
              data-tour="section-switcher"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <InitialsAvatar name={club.name} src={club.logoUrl} className="size-8 text-xs" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{club.name}</span>
                <span className="truncate text-xs text-muted-foreground">{team.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <SectionMenuContent
            data={data}
            onDone={() => setOpenMobile(false)}
            side={isMobile ? "bottom" : "right"}
            className="w-(--radix-dropdown-menu-trigger-width)"
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * Top bar (mobile): the page title with "Club · Section" under it. When the user has several
 * sections or manages the club, the whole block (44px+) opens the section menu.
 */
export function TitleWithSectionSwitcher({ title, className }: { title: string; className?: string }) {
  const { data } = useMyTeam();
  const heading = <span className="truncate text-base leading-tight font-semibold">{title}</span>;
  if (!data?.club || !data.team) return <div className={cn("flex min-w-0 flex-col", className)}>{heading}</div>;

  const subtitle = (
    <span className="flex min-w-0 items-center gap-0.5 text-xs leading-tight text-muted-foreground">
      <span className="truncate">
        {data.club.name} · {data.team.name}
      </span>
      {(data.sections.length > 1 || data.club.isAdmin) && <ChevronDown className="size-3.5 shrink-0" aria-hidden />}
    </span>
  );
  if (data.sections.length <= 1 && !data.club.isAdmin) {
    return (
      <div className={cn("flex min-w-0 flex-col", className)}>
        {heading}
        {subtitle}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${title}. Section active : ${data.team.name}. Changer de section`}
        data-tour="section-switcher"
        className={cn(
          "-mx-2 flex min-h-11 min-w-0 flex-col items-start justify-center rounded-md px-2 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent",
          className,
        )}
      >
        {heading}
        {subtitle}
      </DropdownMenuTrigger>
      <SectionMenuContent data={data} side="bottom" />
    </DropdownMenu>
  );
}

/** "Plus" page (mobile): the user's sections as a list, tap one to make it active. */
export function SectionList() {
  const { data } = useMyTeam();
  const refreshAll = useRefreshAll();
  const switchTo = useActionMutation(switchSection, { onSuccess: () => refreshAll() });
  if (!data?.club || data.sections.length < 2) return null;

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card" aria-label="Mes sections">
      {data.sections.map((section) => (
        <li key={section.teamId}>
          <button
            type="button"
            disabled={switchTo.isPending}
            aria-pressed={section.isActive}
            onClick={() => !section.isActive && switchTo.mutate(section.teamId)}
            className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left outline-none focus-visible:bg-accent active:bg-accent disabled:opacity-60"
          >
            <div className="grid flex-1 leading-tight">
              <span className="truncate font-medium">{section.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {sectionCategoryLabels[section.category]} · {teamRoleLabels[section.role]}
              </span>
            </div>
            {section.isActive ? (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Check className="size-4" aria-hidden /> Active
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Passer à cette section</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
