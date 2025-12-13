import { notifyUser } from "@/features/notifications/notifyUser";
import {
  CheckRequestsLimit,
  FindPlayerById,
} from "@/features/requesttojoinclub/repository/FindPlayerById";
import { requesttojoinclubSchema } from "@/features/requesttojoinclub/schema/requesttojoinclubschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    if (!teamId)
      return NextResponse.json(
        { message: "Aucune équipe trouvée" },
        { status: 400 }
      );

    const team = await prisma.equipe.findUnique({
      where: { id: teamId },
      select: { statut: true },
    });

    if (!team) {
      return NextResponse.json(
        { message: "Équipe introuvable" },
        { status: 404 }
      );
    }

    if (team.statut !== "PUBLIC") {
      return NextResponse.json(
        {
          message: `Ce club est ${team.statut.toLowerCase()}. Vous ne pouvez pas envoyer de demandes.`,
        },
        { status: 403 }
      );
    }

    const userId = await GetSessionId();
    const player = await FindPlayerById(userId, prisma);

    if (!player) {
      return NextResponse.json(
        { message: "Joueur introuvable" },
        { status: 404 }
      );
    }

    if (player.MembreEquipe.length > 0) {
      return NextResponse.json(
        {
          message:
            "Vous avez déjà un club. Quittez-le avant de postuler ailleurs.",
        },
        { status: 403 }
      );
    }

    const activeRequests = await CheckRequestsLimit(userId, prisma);
    if (activeRequests >= 3) {
      return NextResponse.json(
        { message: "Vous avez atteint la limite de 3 demandes en attente." },
        { status: 403 }
      );
    }

    const existingRequest = await prisma.demandeAdhesion.findFirst({
      where: {
        userId: userId,
        equipeId: teamId,
        statut: "ATTENTE",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { message: "Vous avez déjà une demande en cours pour ce club." },
        { status: 409 }
      );
    }

    const { poste, motivation, niveau } = await ZodValidationRequest(
      request,
      requesttojoinclubSchema
    );

    await prisma.demandeAdhesion.create({
      data: {
        poste,
        niveau,
        motivation,
        userId: userId,
        equipeId: teamId,
      },
    });

    const coaches = await prisma.membreEquipe.findMany({
      where: { equipeId: teamId, role: "ENTRAINEUR" },
    });

    await Promise.all(
      coaches.map((coach) => {
        if (coach.userId === userId) return;

        return notifyUser({
          userId: coach.userId,
          type: "DEMANDE_ADHESION",
          title: "Nouvelle demande d'adhésion",
          message: `${player.name} souhaite rejoindre l'équipe au poste de ${poste}.`,
          fromUserName: player.name,
          fromUserImage: player.image || undefined,
        });
      })
    );

    // Notify the player that their request was sent
    const teamInfo = await prisma.equipe.findUnique({
      where: { id: teamId },
      select: { nom: true, logoUrl: true },
    });

    await notifyUser({
      userId: userId,
      type: "DEMANDE_ADHESION",
      title: "Demande envoyée !",
      message: `Votre demande pour rejoindre ${teamInfo?.nom} a bien été envoyée. Vous serez notifié de la réponse du coach.`,
      fromUserName: teamInfo?.nom,
      fromUserImage: teamInfo?.logoUrl || undefined,
    });

    return NextResponse.json(
      {
        message: "Demande envoyée avec succès !",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const userId = await GetSessionId();

    const coachMembership = await prisma.membreEquipe.findUnique({
      where: {
        userId_equipeId: {
          userId: userId,
          equipeId: teamId,
        },
      },
    });

    if (coachMembership?.role !== "ENTRAINEUR") {
      return NextResponse.json(
        { message: "Accès réservé au staff technique." },
        { status: 403 }
      );
    }

    const teamRequests = await prisma.demandeAdhesion.findMany({
      where: { equipeId: teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(teamRequests);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}
