"use client";

import { cn } from "@/lib/utils";
import { MINUTE_PRESETS } from "../playing-time";

/** One tap minutes ("90'", "45'"...): the selected value is highlighted. */
export function MinutePresets({
  value,
  onChange,
  presets = MINUTE_PRESETS,
  className,
}: {
  value: number | undefined;
  onChange: (minutes: number) => void;
  presets?: readonly number[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="group" aria-label="Minutes rapides">
      {presets.map((minutes) => (
        <button
          key={minutes}
          type="button"
          onClick={() => onChange(minutes)}
          aria-pressed={value === minutes}
          className={cn(
            "min-h-9 min-w-11 rounded-full border px-2.5 text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:min-h-8",
            value === minutes ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent",
          )}
        >
          {minutes}&apos;
        </button>
      ))}
    </div>
  );
}
