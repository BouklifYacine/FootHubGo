

"use client";

import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BoutonDarkMode2 } from "@/components/BoutonDarkMode/BoutonDarkMode2";
import React from "react";


export default function DashboardUnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 px-4">
              <BoutonDarkMode2 />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">
            <div className="w-full  mx-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}