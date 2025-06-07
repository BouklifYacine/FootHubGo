import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function MiddlewareUtilisateurNonConnecte (){

  const nonconnecter = "Non connecté"
      const session = await auth.api.getSession({
        headers: await headers(), 
      });
    
      console.log(session || nonconnecter)
     
      if(!session?.session.id || !session?.session.token){
        redirect("/")
      }
}