
import { redirect } from "next/navigation";
import { authClient } from "./auth-client";

  export const DeconnexionClient = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
         redirect('/connexion')
        },
      },
    });
  };