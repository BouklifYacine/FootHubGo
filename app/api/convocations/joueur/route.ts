import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  const now = new Date();

  const selectFields = {
    id: true,
    statut: true,
    dateEnvoi: true,
    dateReponse: true,
    evenement: {
      select: {
        id: true,
        titre: true,
        dateDebut: true,
        lieu: true,
        typeEvenement: true,
        adversaire: true,
        equipe: {
          select: {
            id: true,
            nom: true,
            logoUrl: true,
          },
        },
      },
    },
  };

  const [convocationsFutures, convocationsPassees] = await Promise.all([
    prisma.convocation.findMany({
      where: {
        userId: userId,
        evenement: {
          dateDebut: { gte: now },
        },
      },
      select: selectFields,
      orderBy: {
        evenement: { dateDebut: "asc" },
      },
    }),

    prisma.convocation.findMany({
      where: {
        userId: userId,
        evenement: {
          dateDebut: { lt: now },
        },
      },
      select: selectFields,
      orderBy: {
        evenement: { dateDebut: "desc" },
      },
    }),
  ]);

  const allConvocations = [...convocationsFutures, ...convocationsPassees];

  const stats = {
    total: allConvocations.length,
    passees: convocationsPassees.length,
    confirmes: allConvocations.filter((c) => c.statut === "CONFIRME").length,
    refuses: allConvocations.filter((c) => c.statut === "REFUSE").length,
  };

  return NextResponse.json(
    {
      stats: stats,
      convocations: allConvocations, // La liste complète (pour ne pas casser ton code)
      // convocationsFutures: convocationsFutures,
      convocationsPassees: convocationsPassees,
    },
    { status: 200 }
  );
}
