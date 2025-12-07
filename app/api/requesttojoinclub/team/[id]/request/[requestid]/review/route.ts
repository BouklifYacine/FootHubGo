import { notifyUser } from "@/features/notifications/notifyUser";
import { ReviewRequestSchema } from "@/features/requesttojoinclub/schema/reviewrequestschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestid: string }> }
) {
  try {
    const { id: teamId, requestid } = await params;
    const coachUserId = await GetSessionId();

    const coachMembership = await prisma.membreEquipe.findUnique({
      where: {
        userId_equipeId: {
          userId: coachUserId,
          equipeId: teamId,
        },
      },
    });

    if (coachMembership?.role !== "ENTRAINEUR") {
      return NextResponse.json(
        { message: "Seuls les entraîneurs peuvent gérer les adhésions." },
        { status: 403 }
      );
    }

    const demand = await prisma.demandeAdhesion.findUnique({
      where: { id: requestid },
      include: { user: true, equipe: true },
    });

    if (!demand) {
      return NextResponse.json(
        { message: "Demande introuvable." },
        { status: 404 }
      );
    }

    if (demand.statut !== "ATTENTE") {
      return NextResponse.json(
        { message: "Cette demande a déjà été traitée." },
        { status: 400 }
      );
    }

    const { decision } = await ZodValidationRequest(request, ReviewRequestSchema);

    await prisma.$transaction(async (tx) => {
      
      await tx.demandeAdhesion.update({
        where: { id: requestid },
        data: { statut: decision },
      });

      if (decision === "ACCEPTEE") {
        
        const alreadyMember = await tx.membreEquipe.findUnique({
            where: { userId_equipeId: { userId: demand.userId, equipeId: teamId } }
        });

        if (!alreadyMember) {
            await tx.membreEquipe.create({
              data: {
                userId: demand.userId,
                equipeId: teamId,
                role: "JOUEUR",
                poste: demand.poste,
              },
            });
        }

        await tx.demandeAdhesion.deleteMany({
            where: {
                userId: demand.userId, 
                statut: "ATTENTE",     
                id: { not: requestid } 
            }
        });
      }
    });
    
    const isAccepted = decision === "ACCEPTEE";
    const title = isAccepted ? "Bienvenue dans l'équipe !" : "Réponse à votre demande";
    const message = isAccepted
      ? `Félicitations ! L'entraîneur a accepté votre demande pour rejoindre ${demand.equipe.nom}.`
      : `L'entraîneur de ${demand.equipe.nom} n'a pas retenu votre candidature pour le moment.`;
    
    const notifType = isAccepted ? "REJOINT_CLUB" : "DEMANDE_ADHESION";

    await notifyUser({
      userId: demand.userId, 
      type: notifType,
      title: title,
      message: message,
      fromUserName: demand.equipe.nom, 
      fromUserImage: demand.equipe.logoUrl || undefined,
    });

    return NextResponse.json({
      message: `La demande a été ${isAccepted ? "acceptée" : "refusée"} avec succès.`,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}