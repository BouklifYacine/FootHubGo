"use client";

import { Toaster } from "react-hot-toast";
import { InjuryHeader } from "@/features/injuries/components/InjuryHeader";
import { CreateInjuryDialog } from "@/features/injuries/components/CreateInjuryDialog";
import { InjuryEmptyState } from "@/features/injuries/components/InjuryEmptyState";

export default function BlessurePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <Toaster />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b dark:border-zinc-800 pb-6">
        <InjuryHeader />
        <CreateInjuryDialog />
      </div>
      
      {/* Empty state placeholder or list could go here */}
      <InjuryEmptyState />
    </div>
  );
}
