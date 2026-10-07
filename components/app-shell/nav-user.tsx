"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings, Table } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { signOutAndRedirect } from "@/lib/auth-client";
import { useProfile } from "@/features/settings/hooks/use-profile";

/** Signed-in user at the bottom of the sidebar: settings, admin and sign-out. */
export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: profile } = useProfile();
  const name = profile?.name ?? "";

  const identity = (
    <>
      <Avatar className="size-8 shrink-0 rounded-lg">
        <AvatarImage src={profile?.image ?? undefined} alt={name} />
        <AvatarFallback className="rounded-lg">{name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs">{profile?.email}</span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {identity}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-1 py-1.5">{identity}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Paramètres
              </Link>
            </DropdownMenuItem>
            {profile?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <Table /> Administration
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOutAndRedirect()}>
              <LogOut /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
