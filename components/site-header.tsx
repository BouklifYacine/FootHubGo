"use client";

import Link from "next/link";
import { CreditCard, LayoutDashboard, LogIn, LogOut, Menu, Settings, Table } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { useProfile } from "@/features/settings/hooks/use-profile";

const links = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

/** Public site header (landing, settings, 404). */
export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="tracking-tighter lg:text-2xl">
          FootHubGo
        </Link>

        <nav className="flex items-center gap-4 md:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-lg tracking-tight opacity-80 transition-colors hover:text-purple-600 md:block"
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <UserMenu name={session.user.name} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/sign-in">
                <LogIn /> Connexion
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ name }: { name: string }) {
  const { data: profile } = useProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2" aria-label="Mon compte">
          <Menu className="md:hidden" />
          <Avatar className="hidden cursor-pointer border border-purple-600 transition-transform hover:scale-110 md:flex">
            <AvatarImage src={profile?.image ?? undefined} alt={name} />
            <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app">
            <LayoutDashboard /> Mon club
          </Link>
        </DropdownMenuItem>
        {profile?.plan === "pro" && profile.managesBilling && process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL && (
          <DropdownMenuItem asChild>
            <a href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}>
              <CreditCard /> Abonnement
            </a>
          </DropdownMenuItem>
        )}
        {profile?.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <Table /> Administration
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings /> Paramètres
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOutAndRedirect("/")}>
          <LogOut /> Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
