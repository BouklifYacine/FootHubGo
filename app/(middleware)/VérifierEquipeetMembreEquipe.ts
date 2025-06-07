import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function verifierEquipeEtMembre(equipeId: string, idUtilisateur : string) {
  
  try {
    const equipe = await prisma.equipe.findUnique({ 
      where: { id: equipeId } 
    });

    if (!equipe) {
      return {
        equipe: null,
        membreEquipe: null,
        error: NextResponse.json(
          { message: "Équipe non trouvée" }, 
          { status: 404 }
        ),
      };
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: equipeId,
      },
    });

    if (!membreEquipe) {
      return {
        equipe: null,
        membreEquipe: null,
        error: NextResponse.json(
          { message: "Seuls les membres de cette équipe peuvent accéder à ces données" },
          { status: 403 }
        ),
      };
    }

    return { equipe, membreEquipe, error: null };
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return {
      equipe: null,
      membreEquipe: null,
      error: NextResponse.json(
        { message: "Erreur serveur" }, 
        { status: 500 }
      ),
    };
  }
}