import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { SchemaReponseConvocation } from "@/features/CallUp/schema/CallUpSchema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const {id : convocationId} = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = SchemaReponseConvocation.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: validation.error.errors[0].message
        },
        { status: 400 }
      );
    }

    const { statut } = validation.data;

    const convocation = await prisma.convocation.findUnique({
      where: { id: convocationId },
      select: {
        id: true,
        userId: true,
        statut: true,
        evenementId: true,
        dateReponse: true,
      },
    });

    if (!convocation) {
      return NextResponse.json(
        { message: "Convocation introuvable" },
        { status: 404 }
      );
    }

    if (convocation.userId !== userId) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à modifier cette convocation" },
        { status: 403 }
      );
    }

    if (convocation.statut !== "EN_ATTENTE") {
      return NextResponse.json(
        { message: "Vous avez déjà répondu à cette convocation" },
        { status: 400 }
      );
    }

    const evenement = await prisma.evenement.findUnique({
      where: { id: convocation.evenementId },
      select: { dateDebut: true },
    });

    if (!evenement) {
      return NextResponse.json(
        { message: "Événement introuvable" },
        { status: 404 }
      );
    }

    const now = dayjs();
    const eventDate = dayjs(evenement.dateDebut);

    if (now.isAfter(eventDate)) {
      return NextResponse.json(
        { message: "L'événement est déjà passé, impossible de répondre" },
        { status: 400 }
      );
    }

    const diffHours = eventDate.diff(now, "hour", true);
    if (diffHours < 3) {
      return NextResponse.json(
        { message: "Vous devez répondre au moins 3h avant le début du match" },
        { status: 400 }
      );
    }

    const updatedConvocation = await prisma.convocation.update({
      where: { id: convocationId },
      data: {
        statut: statut,
        dateReponse: new Date(),
      },
      select: {
        id: true,
        statut: true,
        dateReponse: true,
      },
    });

    return NextResponse.json(
      {
        message: "Votre réponse a été enregistrée avec succès",
        convocation: updatedConvocation,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur lors du traitement de la réponse:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}
