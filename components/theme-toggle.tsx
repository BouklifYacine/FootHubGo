"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};
/** False during SSR and hydration: the theme is only known in the browser. */
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Light / dark toggle based on the RESOLVED theme: with the default "system" theme, a user whose
 * system is dark sees the moon and the first tap switches to light.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? <Moon aria-hidden /> : <Sun aria-hidden />}
    </Button>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const;

/** Three-way theme choice (Clair / Sombre / Auto) for the "Plus" page and the settings. */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? (theme ?? "system") : undefined;

  return (
    <div role="radiogroup" aria-label="Thème" className={cn("grid grid-cols-3 gap-1 rounded-lg bg-muted p-1", className)}>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex min-h-10 items-center justify-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            current === value && "bg-background text-foreground shadow-sm",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
