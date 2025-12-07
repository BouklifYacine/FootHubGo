import { requesttojoinclubSchema } from "@/features/requesttojoinclub/schema/requesttojoinclubschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string; 
    requestid: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId, requestid } = await params;
     const userId = GetSessionId()

    const existingRequest = await prisma.demandeAdhesion.findUnique({
      where: { id: requestid },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Demande introuvable." },
        { status: 404 }
      );
    }

    if (existingRequest.equipeId !== teamId) {
      return NextResponse.json(
        { message: "Cette demande ne correspond pas à l'équipe spécifiée." },
        { status: 400 }
      );
    }

    if (existingRequest.userId !== userId) {
      return NextResponse.json(
        { message: "Vous n'êtes pas l'auteur de cette demande." },
        { status: 403 }
      );
    }

    if (existingRequest.statut !== "ATTENTE") {
      return NextResponse.json(
        { message: "Impossible de modifier une demande déjà traitée." },
        { status: 403 }
      );
    }

    const { poste, motivation, niveau } = await ZodValidationRequest(
      request,
      requesttojoinclubSchema
    );

    const updatedRequest = await prisma.demandeAdhesion.update({
      where: { id: requestid },
      data: {
        poste,
        motivation,
        niveau,
      },
    });

    return NextResponse.json({
      message: "Votre demande a été mise à jour.",
      data: updatedRequest,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId, requestid } = await params;
    const userId = GetSessionId()


    const requestToDelete = await prisma.demandeAdhesion.findUnique({
      where: { id: requestid },
    });

    if (!requestToDelete) {
      return NextResponse.json(
        { message: "Demande introuvable." },
        { status: 404 }
      );
    }

    if (requestToDelete.equipeId !== teamId) {
      return NextResponse.json(
        { message: "Incohérence entre l'équipe et la demande." },
        { status: 400 }
      );
    }

    if (requestToDelete.userId !== userId) {
      return NextResponse.json(
        { message: "Vous n'avez pas le droit de supprimer cette demande." },
        { status: 403 }
      );
    }

    if (requestToDelete.statut === "ACCEPTEE") {
      return NextResponse.json(
        { message: "Vous êtes déjà membre. Utilisez l'option 'Quitter le club'." },
        { status: 403 }
      );
    }

    await prisma.demandeAdhesion.delete({
      where: { id: requestid },
    });

    return NextResponse.json({
      message: "Votre demande a été annulée avec succès.",
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}