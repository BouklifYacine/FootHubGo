"use client";

import Link from "next/link";
import { ChevronRight, GraduationCap, LogOut, Table, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSelector } from "@/components/theme-toggle";
import { MORE_NAV, visibleItems } from "@/lib/navigation";
import { signOutAndRedirect } from "@/lib/auth-client";
import { SectionList } from "@/features/clubs/components/section-switcher";
import { InstallAppCard } from "@/features/push/components/install-app-card";
import { useReplayTour } from "@/features/onboarding/hooks/use-tours";
import { useProfile } from "@/features/settings/hooks/use-profile";
import { badgeLabel, badgeText, useNavigation } from "./use-navigation";

/** The "Plus" tab: every page that is not a bottom tab, the theme, the tutorial and sign-out. */
export function MoreMenu() {
  const { context, counts } = useNavigation();
  const { data: profile } = useProfile();
  const replayTour = useReplayTour();
  const items = visibleItems(MORE_NAV, context);
  const name = profile?.name ?? "";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title="Plus" />

      <Link
        href="/app/settings"
        className="flex items-center gap-3 rounded-xl border bg-card p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent"
      >
        <Avatar className="size-12">
          <AvatarImage src={profile?.image ?? undefined} alt="" />
          <AvatarFallback className="bg-muted">{name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name || "Mon profil"}</p>
          <p className="truncate text-sm text-muted-foreground">Photo, poste, mot de passe, notifications</p>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>

      {context.hasClub && (
        <Group title="Mes sections">
          <SectionList />
        </Group>
      )}

      <Group title="Mon club">
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {items.map((item) => (
            <li key={item.href}>
              <Row href={item.href} icon={item.icon} label={item.title}>
                {item.badge && counts[item.badge] > 0 && (
                  <span
                    aria-label={badgeLabel(item.badge, counts[item.badge])}
                    className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white"
                  >
                    {badgeText(counts[item.badge])}
                  </span>
                )}
              </Row>
            </li>
          ))}
        </ul>
      </Group>

      <InstallAppCard />

      <Group title="Apparence">
        <ThemeSelector />
      </Group>

      <Group title="Aide">
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          <li>
            <Row icon={GraduationCap} label="Revoir le tutoriel" onClick={replayTour} tour="tour-replay" />
          </li>
          {profile?.role === "ADMIN" && (
            <li>
              <Row href="/dashboard" icon={Table} label="Administration" />
            </li>
          )}
          <li>
            <Row icon={LogOut} label="Se déconnecter" onClick={() => signOutAndRedirect()} destructive />
          </li>
        </ul>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

type RowProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  tour?: string;
  children?: ReactNode;
};

function Row({ icon: Icon, label, href, onClick, destructive, tour, children }: RowProps) {
  const className =
    "flex min-h-14 w-full items-center gap-3 px-4 text-left outline-none focus-visible:bg-accent active:bg-accent hover:bg-accent/60";
  const content = (
    <>
      <Icon className={destructive ? "size-5 text-destructive" : "size-5 text-muted-foreground"} aria-hidden />
      <span className={destructive ? "flex-1 font-medium text-destructive" : "flex-1 font-medium"}>{label}</span>
      {children}
      {href && <ChevronRight className="size-4 text-muted-foreground" aria-hidden />}
    </>
  );
  return href ? (
    <Link href={href} className={className} data-tour={tour}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} data-tour={tour}>
      {content}
    </button>
  );
}
