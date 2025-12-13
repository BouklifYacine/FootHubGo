"use client";

import React, { memo } from "react";

interface BlockedWarningProps {
  isBlockedByMe: boolean;
  isBlockedByThem: boolean;
}

export const BlockedWarning = memo(function BlockedWarning({
  isBlockedByMe,
  isBlockedByThem,
}: BlockedWarningProps) {
  if (!isBlockedByMe && !isBlockedByThem) return null;

  if (isBlockedByMe) {
    return (
      <div className="px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs text-center border-t border-red-100 dark:border-red-900/20">
        Vous avez bloqué cet utilisateur. Vous ne pouvez pas lui envoyer de
        messages.
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs text-center border-t border-zinc-100 dark:border-zinc-700">
      Vous ne pouvez plus envoyer de messages à cet utilisateur.
    </div>
  );
});
