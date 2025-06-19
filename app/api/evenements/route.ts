import { auth } from "@/auth";
import { CreationEvenementSchema } from "@/features/evenements/schemas/CreationEvenementsSchema";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const userId = "Lm9B28oAI4ShwdFuVDgGevzPedyHcppb";

export async function GET(req: NextRequest) {
  // 1. Auth
  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json(
  //     { message: "Vous devez être connecté." },
  //     { status: 401 }
  //   );
  // }
  // const userId = session.user.id;

  // 2. Récupérer l'équipe
  const membership = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { equipeId: true },
  });
  if (!membership) {
    return NextResponse.json(
      { message: "Vous n'appartenez à aucune équipe." },
      { status: 404 }
    );
  }
  const equipeId = membership.equipeId;

  const qp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(qp.get("page") || "1", 10));
  const pageSize = Math.min( 50, Math.max(1, parseInt(qp.get("pageSize") || "10", 10))
  );
  const skip = (page - 1) * pageSize;

  // 4. Requête
  const [events, total] = await prisma.$transaction([
    prisma.evenement.findMany({
      where: { equipeId },
      orderBy: { dateDebut: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.evenement.count({ where: { equipeId } }),
  ]);

  // 5. Réponse
  return NextResponse.json(
    {
      events,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  // 1. Récupérer l'utilisateur connecté
  //   const session = await auth();
  //   const userId = session?.user?.id;

  // Vérification d'authentification
  if (!userId) {
    return NextResponse.json(
      { message: "Vous devez être connecté pour créer un événement." },
      { status: 401 } // 401 Unauthorized est plus approprié ici
    );
  }

  const body = await request.json();
  const validation = CreationEvenementSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { titre, typeEvenement, adversaire, lieu, dateDebut } = validation.data;

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return NextResponse.json(
      {
        message:
          "Vous devez être entraîneur d'une équipe pour créer des événements.",
      },
      { status: 403 }
    );
  }

  const { equipeId } = membreEquipe;

  try {
    const nowUtc = dayjs();
    const eventDateUtc = dayjs(dateDebut);

    if (eventDateUtc.isBefore(nowUtc)) {
      return NextResponse.json(
        {
          message:
            "La date de début de l'événement ne peut pas être antérieure à la date et heure actuelles.",
        },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.evenement.findFirst({
      where: {
        equipeId: equipeId,
        dateDebut: dateDebut,
      },
    });

    if (existingEvent) {
      return NextResponse.json(
        {
          message:
            "Un événement existe déjà à cette date et heure pour cette équipe.",
        },
        { status: 409 }
      );
    }

    const nouvelEvenement = await prisma.evenement.create({
      data: {
        titre: titre,
        dateDebut: dateDebut,
        typeEvenement: typeEvenement,
        adversaire: adversaire,
        lieu: lieu,
        equipeId: equipeId,
      },
    });

    // 7. Retourner une réponse de succès
    return NextResponse.json(
      {
        message: "Événement créé avec succès !",
        evenement: nouvelEvenement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de l'événement :", error);
  }
}
