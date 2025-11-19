import React from "react";

export const InjuryHeader = () => {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
        Suivi des Blessures
      </h1>
      <p className="text-muted-foreground text-lg font-medium">
        Gérez votre état de santé et communiquez avec le staff médical.
      </p>
    </div>
  );
};
