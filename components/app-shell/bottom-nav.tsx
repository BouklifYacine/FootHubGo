"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MORE_TAB, PRIMARY_NAV, isActive, visibleItems, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { badgeLabel, badgeText, useNavigation } from "./use-navigation";

/**
 * Bottom tab bar of the app under `md` (thumb reach): Accueil · Agenda · Équipe · Messages · Plus.
 * Fixed, above the home indicator (safe area). The desktop gets the sidebar instead.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { context, counts } = useNavigation();
  const items = [...visibleItems(PRIMARY_NAV, context), MORE_TAB];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <ul className="mx-auto flex h-(--app-bottom-nav-height) max-w-md items-stretch">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Tab item={item} active={isActive(item, pathname)} count={item.badge ? counts[item.badge] : 0} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Tab({ item, active, count }: { item: NavItem; active: boolean; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      data-tour={item.tour}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground transition-colors outline-none focus-visible:bg-accent",
        active && "text-foreground",
      )}
    >
      <span
        className={cn(
          "relative flex h-7 w-14 items-center justify-center rounded-full transition-colors",
          active && "bg-accent",
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2.4 : 2} aria-hidden />
        {count > 0 && item.badge && (
          <span
            aria-label={badgeLabel(item.badge, count)}
            className="absolute -top-1 right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background"
          >
            {badgeText(count)}
          </span>
        )}
      </span>
      {item.title}
    </Link>
  );
}
