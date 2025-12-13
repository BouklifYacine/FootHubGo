"use client";

import React, { memo } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyChatProps {
  className?: string;
}

export const EmptyChat = memo(function EmptyChat({
  className,
}: EmptyChatProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center text-zinc-500",
        className
      )}
    >
      <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
      <p className="text-lg font-medium">Sélectionnez une conversation</p>
      <p className="text-sm">ou créez-en une nouvelle</p>
    </div>
  );
});
