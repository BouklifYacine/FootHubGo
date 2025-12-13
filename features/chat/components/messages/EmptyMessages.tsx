"use client";

import React, { memo } from "react";
import { MessageSquare } from "lucide-react";

export const EmptyMessages = memo(function EmptyMessages() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
      <p>Aucun message. Dites bonjour !</p>
    </div>
  );
});
