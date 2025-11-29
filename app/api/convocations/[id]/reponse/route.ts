import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { SchemaReponseConvocation } from "@/features/CallUp/schema/CallUpSchema";
import { FindConvocationById } from "@/features/CallUp/repository/FindUniqueConvocationRepository";
import { PrismaClient } from "@prisma/client";
import { UpdateCallUpPlayerByCallUpId } from "@/features/CallUp/repository/UpdateCallUpPlayerByCallUpId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { notifyUser } from "@/features/notifications/notifyUser";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: convocationId } = await params;

  const userId = await GetSessionId();

  try {
    const { statut } = await ZodValidationRequest(
      request,
      SchemaReponseConvocation
    );

    const updatedConvocation = await prisma.$transaction(async (tx) => {
      const convocation = await FindConvocationById(
        convocationId,
        tx as PrismaClient
      );

      if (!convocation) {
        throw new Error("Convocation introuvable");
      }

      if (convocation.userId !== userId) {
        throw new Error(
          "Vous n'êtes pas autorisé à modifier cette convocation"
        );
      }

      if (convocation.statut !== "EN_ATTENTE") {
        throw new Error("Vous avez déjà répondu à cette convocation");
      }

      const evenement = await tx.evenement.findUnique({
        where: { id: convocation.evenementId },
        select: { 
          dateDebut: true,
          equipeId: true,
          titre: true,
        },
      });

      if (!evenement) {
        throw new Error("Événement introuvable");
      }

      const now = dayjs();
      const eventDate = dayjs(evenement.dateDebut);

      if (now.isAfter(eventDate)) {
        throw new Error("L'événement est déjà passé, impossible de répondre");
      }

      const diffHours = eventDate.diff(now, "hour", true);
      if (diffHours < 3) {
        throw new Error(
          "Vous devez répondre au moins 3h avant le début du match"
        );
      }

      await UpdateCallUpPlayerByCallUpId(
        convocationId,
        tx as PrismaClient,
        statut
      );
      return { evenement, convocation };
    });

    const joueur = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (joueur) {
      const entraineurs = await prisma.membreEquipe.findMany({
        where: {
          equipeId: updatedConvocation.evenement.equipeId,
          role: "ENTRAINEUR",
        },
      });

      for (const entraineur of entraineurs) {
        if (entraineur.userId === userId) continue; 

        const message =
          statut === "CONFIRME"
            ? `${joueur.user.name} a confirmé sa présence pour ${updatedConvocation.evenement.titre}`
            : `${joueur.user.name} a refusé la convocation pour ${updatedConvocation.evenement.titre}`;

        await notifyUser({
          userId: entraineur.userId, 
          type: "CONVOCATION_MATCH",
          title: `Réponse à convocation`,
          message: message,
          fromUserName: joueur.user.name,
          fromUserImage: joueur.user.image || "",
        });
      }
    }

    return NextResponse.json(
      {
        message: "Votre réponse a été enregistrée avec succès",
        convocation: updatedConvocation,
      },
      { status: 200 }
    );
  } catch (error: unknown) {

    console.error("Erreur lors du traitement de la réponse:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}
