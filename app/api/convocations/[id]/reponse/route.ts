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
  const { id: convocationId } = await params;

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
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { statut } = validation.data;
  
    const updatedConvocation = await prisma.$transaction(async (tx) => {

      const convocation = await tx.convocation.findUnique({
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
        throw new Error("Convocation introuvable");
      }

      if (convocation.userId !== userId) {
        throw new Error("Vous n'êtes pas autorisé à modifier cette convocation");
      }

      if (convocation.statut !== "EN_ATTENTE") {
        throw new Error("Vous avez déjà répondu à cette convocation");
      }

      // 2. Récupère l'événement dans la transaction
      const evenement = await tx.evenement.findUnique({
        where: { id: convocation.evenementId },
        select: { dateDebut: true },
      });

      if (!evenement) {
        throw new Error("Événement introuvable");
      }

      const now = dayjs();
      const eventDate = dayjs(evenement.dateDebut);

      if (now.isAfter(eventDate)) {
        throw new Error(
          "L'événement est déjà passé, impossible de répondre"
        );
      }

      const diffHours = eventDate.diff(now, "hour", true);
      if (diffHours < 3) {
        throw new Error(
          "Vous devez répondre au moins 3h avant le début du match"
        );
      }

      // 3. Update atomique, toujours dans la transaction
      return await tx.convocation.update({
        where: { id: convocationId, statut: "EN_ATTENTE" },
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
    });

    // Si tout a réussi, on retourne à l'extérieur de la transaction
    return NextResponse.json(
      {
        message: "Votre réponse a été enregistrée avec succès",
        convocation: updatedConvocation,
      },
      { status: 200 }
    );
  } 
  
  catch (error: unknown) {  
  if (error instanceof Error) {
    const message = error.message;
    
    const messagesConnues = [
      "Convocation introuvable",
      "Vous n'êtes pas autorisé à modifier cette convocation",
      "Vous avez déjà répondu à cette convocation",
      "Événement introuvable",
      "L'événement est déjà passé, impossible de répondre",
      "Vous devez répondre au moins 3h avant le début du match",
    ];
    
    if (messagesConnues.includes(message)) {
      return NextResponse.json({ message }, { status: 400 });
    }
  }
  
  console.error("Erreur lors du traitement de la réponse:", error);
  return NextResponse.json(
    { message: "Erreur lors du traitement de la requête" },
    { status: 500 }
  );
}

}
