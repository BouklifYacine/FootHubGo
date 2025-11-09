import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string; idevenement: string } }
) {
  const { id, idevenement } = await params; 

  const session = await auth.api.getSession({ headers: await headers() });
  const idUtilisateur = session?.user?.id;

  try {
    if (!idUtilisateur) {
      return NextResponse.json({ message: "Authentification requise" }, { status: 401 });
    }

    const equipe = await prisma.equipe.findUnique({ where: { id } });
    if (!equipe) {
      return NextResponse.json({ message: "Équipe non trouvée" }, { status: 404 });
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId: idUtilisateur, equipeId: id },
      select: { role: true },
    });
    
    if (!membreEquipe) {
      return NextResponse.json(
        { message: "Seuls les membres de cette équipe peuvent accéder à ces données" },
        { status: 403 }
      );
    }

    const equipeComplete = await prisma.equipe.findUnique({
      where: { id },
      include: {
        MembreEquipe: {
          select: {
            isLicensed: true,
            role: true,
            poste: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
                blessures: {
                  where: {
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                  },
                },
                Convocation: {
                  where: { evenementId: idevenement }, // ← Filtre direct
                  select: {
                    id: true,
                    statut: true,
                    dateEnvoi: true,
                    dateReponse: true,
                    evenementId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const TeamMembersCallUp = equipeComplete?.MembreEquipe?.map((membre) => ({
      id: membre.user.id,
      name: membre.user.name,
      email: membre.user.email,
      image: membre.user.image,
      position: membre.role,
      isLicensed: membre.isLicensed,
      poste : membre.poste,
      isBlessed: membre.user.blessures.length > 0,
      convocations: membre.user.Convocation.map(conv => ({
        id: conv.id,
        statut: conv.statut,
        dateEnvoi: conv.dateEnvoi,
        dateReponse: conv.dateReponse,
        evenementId: conv.evenementId,
      })),
    })) || [];

    return NextResponse.json({
      RolePlayer: membreEquipe.role,
      equipe: {
        id: equipeComplete!.id,
        nom: equipeComplete!.nom,
        membres: TeamMembersCallUp,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'équipe:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
