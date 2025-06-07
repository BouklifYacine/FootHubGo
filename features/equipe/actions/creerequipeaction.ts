import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CreationEquipeInputs, CreationEquipeSchema } from "../schemas/SchemaEquipe";

export async function creerEquipe(data: CreationEquipeInputs) {
  try {
    const validation = CreationEquipeSchema.safeParse(data);
    
    if (!validation.success) {
      return {
        success: false,
        message: "Données invalides",
        erreurs: validation.error.format()
      };
    }
  
 const session = await auth.api.getSession({
    headers: await headers() 
});
    const idUtilisateur = session?.user?.id;
    
    if (!idUtilisateur) {
      return { 
        success: false, 
        message: "Vous devez être connecté" 
      };
    }

    const utilisateur = await prisma.user.findUnique({
      where: { id: idUtilisateur },
    });
    
    if (!utilisateur) {
      return {
        success: false,
        message: "Utilisateur introuvable"
      };
    }
    
    const equipeExistante = await prisma.equipe.findFirst({
      where: {
        nom: {
          mode: "insensitive",
          equals: data.nom.trim(),
        },
      },
    });
    
    if (equipeExistante) {
      return {
        success: false,
        message: "Une équipe avec ce nom existe déjà"
      };
    }
    
    const dejaEntraineur = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        role: "ENTRAINEUR",
      },
    });
    
    if (dejaEntraineur) {
      return {
        success: false,
        message: "Vous êtes déjà entraîneur d'une équipe"
      };
    }
    
    const nouvelleEquipe = await prisma.$transaction(async (tx) => {
      const equipe = await tx.equipe.create({
        data: {
          nom: data.nom.trim(),
          description: data.description || null,
          logoUrl: data.logoUrl || null,
        },
      });
      
      await tx.membreEquipe.create({
        data: {
          userId: idUtilisateur,
          equipeId: equipe.id,
          role: "ENTRAINEUR",
        },
      });
      
      await tx.user.update({
        where: { id: idUtilisateur },
        data: {
          roleEquipe: "ENTRAINEUR",
          AunClub: "OUI",
        },
      });
      
      return equipe;
    });
    
    revalidatePath('/dashboardclient');
    
    return {
      success: true,
      message: "Équipe créée avec succès",
      equipe: nouvelleEquipe
    };
    
  } catch (error) {
    console.error("Erreur lors de la création de l'équipe:", error);
    return {
      success: false,
      message: "Erreur lors de la création de l'équipe"
    };
  }
}
