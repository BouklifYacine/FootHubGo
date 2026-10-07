"use client";

import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { AppSidebar } from "./app-sidebar";

/** Sidebar + top bar of the signed-in areas (`/app` and the admin `/dashboard`). */
export function AppShell({ variant, children }: { variant: "app" | "admin"; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar variant={variant} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="flex-1" />
            {variant === "app" && <NotificationBell />}
            <ThemeToggle />
          </header>
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
