"use server"

import { auth } from "@/auth";
import { prisma } from "@/prisma"
import { headers } from "next/headers";
import { redirect } from "next/navigation"

export async function UtilisateurAbonner(){
  const session = await auth.api.getSession({
      headers: await headers() 
  });
     if(!session?.user?.id) redirect('/')

    const utilisateurexistant = await prisma.user.findUnique({
        where : { id : session.user?.id}
    })

    if(!utilisateurexistant) return {success : false}

    return {success : true , abonner : utilisateurexistant.plan === "pro"}
}