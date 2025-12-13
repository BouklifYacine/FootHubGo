"use client";

import React, { memo, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface RateLimitWarningProps {
  isRateLimited: boolean;
  onExpire?: () => void;
}

export const RateLimitWarning = memo(function RateLimitWarning({
  isRateLimited,
  onExpire,
}: RateLimitWarningProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isRateLimited) {
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimited]);

  // Handle expiration when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isRateLimited) {
      onExpire?.();
      setCountdown(60);
    }
  }, [countdown, isRateLimited, onExpire]);

  if (!isRateLimited) return null;

  return (
    <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm text-center border-t border-amber-200 dark:border-amber-800/30 flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <span>
        Vous envoyez trop de messages. Patientez{" "}
        <strong className="font-semibold">{countdown}s</strong> avant de
        réessayer.
      </span>
    </div>
  );
});
