"use client";

import React, { memo } from "react";

interface TypingIndicatorProps {
  userName: string;
}

export const TypingIndicator = memo(function TypingIndicator({
  userName,
}: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 italic">{userName} écrit</span>
        <span className="flex gap-0.5">
          <span
            className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
});
