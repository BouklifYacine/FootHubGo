import { NextRequest, NextResponse } from "next/server";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { FindInjuriesPlayer } from "@/features/injuries/repository/FindInjuriesPlayer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await GetSessionId();

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const playerId = id;

    const injuries = await FindInjuriesPlayer(playerId);

    return NextResponse.json({ injuries }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET blessures joueur:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
