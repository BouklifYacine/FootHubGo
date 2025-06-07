"use client";

import {
  ChartPie,
  CreditCard,
  DoorOpen,
  LogOut,
  Menu,
  Settings,
  Star,
  Table,
  Table2,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { DeconnexionClient } from "@/lib/FonctionDeconnexionClient";

interface MenuDeroulantProps {
  imageUrl: string;
  userName: string;
  isLoading: boolean;
  abonnement?: boolean;
  admin?: boolean;
  isLogged: boolean;
}

export default function MenuDeroulant({
  imageUrl,
  userName,
  isLoading,
  abonnement,
  admin,
  isLogged,
}: MenuDeroulantProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Menu className="cursor-pointer " />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {isLoading ? (
            <div className="flex items-center justify-center w-6 h-6">
              <Loader variant="circular" />
            </div>
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={
                  isLogged
                    ? imageUrl
                    : "https://cdn.vox-cdn.com/thumbor/r0U59Lx7DOSI2Z_F7WLnzcbQfuU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24953495/1698708349.jpg"
                }
                alt={isLogged ? userName || "User avatar" : "Logo"}
              />
              <AvatarFallback>
                {isLogged
                  ? userName?.[0]?.toUpperCase() || ""
                  : "LFC"}
              </AvatarFallback>
            </Avatar>
          )}
          <DropdownMenuLabel className="px-0">Mon compte</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />

        {isLogged && abonnement && (
          <Link
            href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL!}
            className="cursor-pointer"
          >
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4 " />
              <span className=" font-medium">Abonnement</span>
            </DropdownMenuItem>
          </Link>
        )}
        {isLogged && admin && (
          <Link href="/dashboard" className="cursor-pointer">
            <DropdownMenuItem>
              <Table className="mr-2 h-4 w-4 " />
              <span className="">Dashboard</span>
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />

        {isLogged ? (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{userName || "Profil"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ChartPie className="mr-2 h-4 w-4" />
              <span>Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Table2 className="mr-2 h-4 w-4" />
              <span>Classement</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              <span>Favoris</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <Link
                href={`/parametres`}
                className="cursor-pointer"
              >
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => DeconnexionClient()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <Link href="connexion">
            <DropdownMenuItem>
              <DoorOpen className="mr-2 h-4 w-4" />
              <span>Connexion</span>
            </DropdownMenuItem>
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}