"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GlassFilter } from "@/components/liquid-radio";

interface ToggleViewButtonProps {
  value: "players" | "stats";
  onValueChange: (value: "players" | "stats") => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function ToggleViewButton({
  value,
  onValueChange,
  leftLabel = "Joueurs",
  rightLabel = "Statistiques",
}: ToggleViewButtonProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-background/80 after:shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=players]:after:translate-x-0 data-[state=stats]:after:translate-x-full dark:after:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
      data-state={value}
    >
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
        style={{ filter: 'url("#radio-glass")' }}
      />
      
      <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 py-2 transition-colors text-muted-foreground/70 group-data-[state=stats]:text-muted-foreground/70 group-data-[state=players]:text-foreground">
        {leftLabel}
        <RadioGroupItem id="view-players" value="players" className="sr-only" />
      </label>
      
      <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 py-2 transition-colors text-muted-foreground/70 group-data-[state=players]:text-muted-foreground/70 group-data-[state=stats]:text-foreground">
        {rightLabel}
        <RadioGroupItem id="view-stats" value="stats" className="sr-only" />
      </label>
      
      <GlassFilter />
    </RadioGroup>
  );
}
