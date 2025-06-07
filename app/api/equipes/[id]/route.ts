import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers() 
})
  const idUtilisateur = session?.user?.id;
  
  console.log("ID d'équipe reçu:", id);
  console.log("ID d'utilisateur:", idUtilisateur);
  
  try {
   
    const equipe = await prisma.equipe.findUnique({
      where: { id },
    });
    
    if (!equipe) {
      console.log("Équipe non trouvée:", id);
      return NextResponse.json(
        { message: "Équipe non trouvée" },
        { status: 404 }
      );
    }
    
    if (!idUtilisateur) {
      return NextResponse.json(
        { message: "Authentification requise" },
        { status: 401 }
      );
    }
    
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: id,
      },
    });
    
    if (!membreEquipe) {
      console.log("Utilisateur non membre de l'équipe");
      return NextResponse.json(
        {
          message: "Seuls les membres de cette équipe peuvent accéder à ces données",
        },
        { status: 403 }
      );
    }
    
    const equipeComplete = await prisma.equipe.findUnique({
      where: { id },
      include: {
        membres: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              }
            }
          }
        },
      },
    });
    
  
    return NextResponse.json({ 
      ListeEquipe: equipeComplete, 
      userId: idUtilisateur 
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'équipe:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

