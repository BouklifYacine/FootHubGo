"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerCodeInvitation(id : string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Accès non autorisé. Vous devez être connecté.",
    };
  }

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      equipeId: id,
      userId,
      role: "ENTRAINEUR",
    },
  });

  if (!membreEquipe) {
     return {
      success: false,
       message: "Action non autorisée. Seul l'entraîneur peut agir.",
    };
  }

  const equipeMiseAJour = await prisma.equipe.update({
    where: { id: id },
    data: { codeInvitation: null }, 
  });

   return {
      success: true,
     message: `Le code d'invitation pour l'équipe ${equipeMiseAJour.nom} a été supprimé.`,
    };
  
}