"use client";

import Image from "next/image";
import GithubIcon from "@/public/github-icon-2.svg";
import GoogleIcon from "@/public/Google.png";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const providers = [
  { id: "github", label: "GitHub", icon: GithubIcon },
  { id: "google", label: "Google", icon: GoogleIcon },
] as const;

export function SocialSignInButtons({ mode, next = "/app" }: { mode: "sign-in" | "sign-up"; next?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => authClient.signIn.social({ provider: provider.id, callbackURL: next })}
        >
          <Image src={provider.icon} alt="" width={25} height={25} />
          {mode === "sign-up" ? "S'inscrire" : "Se connecter"} avec {provider.label}
        </Button>
      ))}
    </div>
  );
}
