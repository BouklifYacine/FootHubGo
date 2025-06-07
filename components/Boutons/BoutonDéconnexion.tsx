"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function BoutonDeconnexion() {
  const Router = useRouter();
  const Deconnexion = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          Router.push("/");
          Router.refresh()
        },
      },
    });
  };
  return (
    <Button
      onClick={Deconnexion}
      variant="ghost"
      className=" border-blue-500 border flex items-center gap-2 cursor-pointer"
    >
      Déconnexion <LogOut size={16} />
    </Button>
  );
}
