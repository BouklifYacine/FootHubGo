"use client";

import { useState } from "react";
import { Bell, Key, Mail, Trash2, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProfile } from "../hooks/use-profile";
import { EmailForm, NameForm, PasswordForm } from "./account-forms";
import { DeleteAccountCard } from "./delete-account-card";
import { NotificationsCard } from "./notifications-card";
import { ProfileCard } from "./profile-card";

const sections = [
  { id: "profile", label: "Profil", icon: UserCircle },
  { id: "name", label: "Pseudo", icon: User },
  { id: "email", label: "Email", icon: Mail, passwordOnly: true },
  { id: "password", label: "Mot de passe", icon: Key, passwordOnly: true },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "delete", label: "Supprimer le compte", icon: Trash2, danger: true },
] as const;

type SectionId = (typeof sections)[number]["id"];

/** Settings of the signed-in user (always the session user, never an id from the URL). */
export function SettingsView() {
  const [active, setActive] = useState<SectionId>("profile");
  const { data: profile, isPending, error } = useProfile();

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (error) return <p className="text-destructive">{error.message}</p>;

  // Email and password can only be changed on accounts that have a password.
  const visible = sections.filter((section) => !("passwordOnly" in section) || profile.hasPassword);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
      <Card className="h-fit p-4">
        <nav className="flex flex-col gap-1">
          {visible.map((section) => (
            <Button
              key={section.id}
              variant={active === section.id ? "default" : "ghost"}
              className={cn("justify-start", "danger" in section && "text-destructive")}
              onClick={() => setActive(section.id)}
            >
              <section.icon className="mr-2 size-4" />
              {section.label}
            </Button>
          ))}
        </nav>
      </Card>

      <div>
        {active === "profile" && <ProfileCard profile={profile} />}
        {active === "name" && <NameForm currentName={profile.name} hasPassword={profile.hasPassword} />}
        {active === "email" && profile.hasPassword && <EmailForm />}
        {active === "password" && profile.hasPassword && <PasswordForm />}
        {active === "notifications" && <NotificationsCard emailReminders={profile.emailReminders} />}
        {active === "delete" && <DeleteAccountCard hasPassword={profile.hasPassword} />}
      </div>
    </div>
  );
}
