import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// POST /api/chat/conversations/pin - Pin or unpin a conversation
export async function POST(request: NextRequest) {
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
    const { conversationId, action } = body;

    if (!conversationId || !action || !["pin", "unpin"].includes(action)) {
      return NextResponse.json(
        { message: "conversationId et action (pin/unpin) requis" },
        { status: 400 }
      );
    }

    // Find the participant record
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { message: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Update isPinned status
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { isPinned: action === "pin" },
    });

    return NextResponse.json({
      success: true,
      action,
      conversationId,
      isPinned: action === "pin",
    });
  } catch (error) {
    console.error("Error pinning conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
