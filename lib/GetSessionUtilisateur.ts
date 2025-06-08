import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function GetSessionUtilisateur() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const SessionID = session?.user?.id;

    if (!SessionID) {
      return null;
    }

    const utilisateur = await prisma.user.findUnique({
      where: { id: SessionID },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        roleEquipe: true,
        membreEquipe: {
          select: {
            id: true,
            role: true,
            posteJoueur: true,
            dateAdhesion: true,
            equipeId: true,
            equipe: {
              select: {
                id: true,
                nom: true,
                logoUrl: true,
                codeInvitation: true,
              },
            },
          },
        },
      },
    });

    return utilisateur;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
}
