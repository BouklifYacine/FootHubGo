"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface RateLimitWarningProps {
  isRateLimited: boolean;
  onExpire?: () => void;
}

export function RateLimitWarning({
  isRateLimited,
  onExpire,
}: RateLimitWarningProps) {
  if (!isRateLimited) return null;

  return <RateLimitCountdown onExpire={onExpire} />;
}

function RateLimitCountdown({ onExpire }: { onExpire?: () => void }) {
  const countdownRef = useRef(60);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      countdownRef.current -= 1;
      if (countdownRef.current <= 0) {
        countdownRef.current = 60;
        onExpire?.();
      }
      setCountdown(countdownRef.current);
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

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
}
