"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  
} from "@/components/ui/sidebar";
import { Fan } from "lucide-react";

export function TeamSwitcher({

}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  // const { isMobile } = useSidebar();
 

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="">
                <Fan className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{"Devgogo"}</span>
                <span className="truncate text-xs">{"Free"}</span>
              </div>
           
            </SidebarMenuButton>
          </DropdownMenuTrigger>
       
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
