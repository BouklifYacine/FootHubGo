"use client";

import React, { memo } from "react";
import { MessageSquare } from "lucide-react";

export const EmptyConversations = memo(function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        Aucune conversation
      </p>
      <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
        Cliquez sur + pour démarrer
      </p>
    </div>
  );
});
