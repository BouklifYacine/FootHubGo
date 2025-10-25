import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

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
    select: { id: true, name: true },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  const convocations = await prisma.convocation.findMany({
    where: {
      userId: userId,
    },
    select: {
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
    },
    orderBy: {
      dateEnvoi: "desc",
    },
  });

  const now = dayjs();
  const convocationsFutures = convocations.filter((c) =>
    dayjs(c.evenement.dateDebut).isAfter(now)
  );
  const convocationsPassees = convocations.filter((c) =>
    dayjs(c.evenement.dateDebut).isBefore(now)
  );

  const stats = {
    total: convocations.length,
    futures: convocationsFutures.length,
    passees: convocationsPassees.length,
    // enAttente: convocations.filter((c) => c.statut === "EN_ATTENTE").length,
    confirmes: convocations.filter((c) => c.statut === "CONFIRME").length,
    refuses: convocations.filter((c) => c.statut === "REFUSE").length,
  };

  return NextResponse.json(
    {
      stats: stats,
      convocationsFutures: convocationsFutures,
      convocationsPassees: convocationsPassees,
    },
    { status: 200 }
  );
}
