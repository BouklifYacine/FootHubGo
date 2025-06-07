import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function supprimerEquipe(equipeId: string) {
  try {
 const session = await auth.api.getSession({
    headers: await headers() 
});
    const userId = session?.user?.id;
    
    if (!userId) {
      return { 
        success: false, 
        message: "Vous devez être connecté" 
      };
    }
    
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
    });
    
    if (!equipe) {
      return {
        success: false,
        message: "Équipe non trouvée"
      };
    }
    
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: userId,
        equipeId: equipeId,
        role: "ENTRAINEUR"
      }
    });
    
    if (!membreEquipe) {
      return { 
        success: false, 
        message: "Seuls les entraineurs peuvent supprimer l'équipe" 
      };
    }
    
    const nomEquipe = equipe.nom;
    
    const membres = await prisma.membreEquipe.findMany({
      where: { equipeId: equipeId },
      select: { userId: true }
    });
    
    await prisma.$transaction(async (tx) => {
      for (const membre of membres) {
        await tx.user.update({
          where: { id: membre.userId },
          data: {
            roleEquipe: "SANSCLUB",
            AunClub: "NON",
          },
        });
      }
      
      await tx.equipe.delete({
        where: { id: equipeId },
      });
    });
    
    revalidatePath('/dashboardclient');
    
    return { 
      success: true, 
      message: `L'équipe ${nomEquipe} a été supprimée avec succès`,
      nomEquipe
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression de l'équipe:", error);
    return { 
      success: false, 
      message: "Une erreur est survenue lors de la suppression de l'équipe" 
    };
  }
}