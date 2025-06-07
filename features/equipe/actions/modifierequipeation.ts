import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ModifierEquipeInputs } from "../schemas/SchemaEquipe";

export async function modifierEquipe(
  equipeId: string,
  data: ModifierEquipeInputs
) {
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
    
    const membre = await prisma.membreEquipe.findFirst({
      where: {
        userId: userId,
        equipeId: equipeId,
        role: "ENTRAINEUR"
      }
    });
    
    if (!membre) {
      return { 
        success: false, 
        message: "Seuls les entraineurs peuvent modifier les informations de l'équipe" 
      };
    }
    
    const equipeModifiee = await prisma.equipe.update({
      where: { id: equipeId },
      data: {
        nom: data.nom,
        description: data.description,
        logoUrl: data.logoUrl
      }
    });
    
    revalidatePath(`/dashboardclient/equipe/${equipeId}`);
    
    return { 
      success: true, 
      message: "Équipe mise à jour avec succès", 
      equipe: equipeModifiee 
    };
    
  } catch (error) {
    console.error("Erreur lors de la modification de l'équipe:", error);
    return { 
      success: false, 
      message: "Une erreur est survenue lors de la modification de l'équipe" 
    };
  }
}