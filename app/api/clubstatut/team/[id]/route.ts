import { FindCoachById } from "@/features/clubstatus/repository/FindCoachByIdRepository";
import { SchemaClubStatus } from "@/features/clubstatus/schema/clubstatutschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { 
    const { id: teamId } = await params;

    const userId = 'HVnXvxnolDldN0Les8A2RzoZkwB5OCCh'

    if (!teamId) return NextResponse.json({
      message : "Aucune équipe trouvée"
    }, { status: 400 }) 

    const Coach = await FindCoachById(teamId, userId, prisma);

    if(Coach?.role !== "ENTRAINEUR") return NextResponse.json({
      message : "Vous devez etre coach de l'équipe pour changer le statut du club "
    }, { status: 403 })

    const { StatutClub } = await ZodValidationRequest( request, SchemaClubStatus );

    const StatutClubUpdate = await prisma.equipe.update({
      where : {
        id : teamId
      },
      data : {
        statut : StatutClub
      }
    })

    return NextResponse.json({
      message : `Votre club est passer au statut ${StatutClubUpdate.statut}`
    })

  } catch (error) { 

    if (error instanceof Error)

    return NextResponse.json({
      message: error.message || "Une erreur est survenue"
    }, { status: 400 }) 
  }
}