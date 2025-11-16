"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { DeconnexionClient } from "@/lib/FonctionDeconnexionClient";
import { useProfil } from "@/features/parametres/hooks/useProfil";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session } = authClient.useSession();
  const SessionUser = session?.user;
  const { data: Profil, isLoading } = useProfil(SessionUser?.id || "");

  const imageUrl = Profil?.image ?? "";
  const userName = SessionUser?.name ?? "";
  const userEmail = SessionUser?.email ?? "";

  const Deconnexion = async () => {
    await DeconnexionClient();
  };

  // Première lettre du nom, ou vide si pas de nom
  const firstLetter = userName ? userName[0].toUpperCase() : "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            >
              {isLoading ? (
                <div className="h-8 w-8 flex items-center justify-center">
                  <Loader variant="circular" />
                </div>
              ) : (
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage src={imageUrl} alt={"Logo profil"} />
                  <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
          {2}
        </Badge>
                  <AvatarFallback className="rounded-lg">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {isLoading ? (
                  <div className="h-8 w-8 flex items-center justify-center">
                    <Loader variant="circular" />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={imageUrl} alt={"Logo profil"} />
                    <AvatarFallback className="rounded-lg">
                      {firstLetter}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Exemple 1
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Exemple 2
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Exemple 3
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={Deconnexion}>
              <LogOut />
              Deconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}