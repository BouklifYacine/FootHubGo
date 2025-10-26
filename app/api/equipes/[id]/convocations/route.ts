import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  // const idUtilisateur = session?.user?.id;
   const idUtilisateur = "2cXsE8BlLpdHKiJdOrDXPpi7rmHDXhK9";

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
      select : {role : true},
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
          },
        },
      },
    },
  },
});


    const membresAvecBlessure = equipeComplete?.MembreEquipe?.map((membre) => ({
      id: membre.user.id,
      name: membre.user.name,
      email: membre.user.email,
      image: membre.user.image,
      position : membre.role,
      isLicensed : membre.isLicensed,
      isBlessed: membre.user.blessures.length > 0,
    })) || [];

    return NextResponse.json({
      RolePlayer : membreEquipe.role,
      userId: idUtilisateur,
      equipe: {
        id: equipeComplete!.id,
        nom: equipeComplete!.nom,
        membres: membresAvecBlessure,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'équipe:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
