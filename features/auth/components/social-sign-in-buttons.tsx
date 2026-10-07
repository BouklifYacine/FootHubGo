"use client";

import Image from "next/image";
import GithubIcon from "@/public/github-icon-2.svg";
import GoogleIcon from "@/public/Google.png";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const providers = [
  { id: "github", label: "Github", icon: GithubIcon },
  { id: "google", label: "Google", icon: GoogleIcon },
] as const;

export function SocialSignInButtons() {
  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => authClient.signIn.social({ provider: provider.id, callbackURL: "/app" })}
        >
          <Image src={provider.icon} alt="" width={25} height={25} />
          Connexion avec {provider.label}
        </Button>
      ))}
    </div>
  );
}
