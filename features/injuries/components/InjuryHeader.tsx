import React from "react";

export const InjuryHeader = ({ isCoach }: { isCoach?: boolean }) => {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
        {isCoach ? "Gestion des Blessures" : "Suivi des Blessures"}
      </h1>
      <p className="opacity-70 text-md font-medium">
        {isCoach
          ? "Suivez l'état de santé de votre effectif et gérez les blessures."
          : "Gérez votre état de santé et communiquez avec l'entraineur de votre disponibilité."}
      </p>
    </div>
  );
};
