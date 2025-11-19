import { Activity } from "lucide-react";
import React from "react";

export const InjuryEmptyState = () => {
  return (
    <div className="rounded-xl border border-dashed dark:border-zinc-800 p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
        <Activity className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Aucune blessure active</h3>
      <p className="text-muted-foreground">
        L'historique de vos blessures apparaîtra ici.
      </p>
    </div>
  );
};
