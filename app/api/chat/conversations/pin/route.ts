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

    // Update isPinned status directly using composite unique key
    // This atomic operation avoids the need for a separate findUnique call
    try {
      const updatedParticipant = await prisma.conversationParticipant.update({
        where: {
          userId_conversationId: {
            userId,
            conversationId,
          },
        },
        data: { isPinned: action === "pin" },
        select: { conversationId: true, isPinned: true }, // Select only what we need
      });

      return NextResponse.json({
        success: true,
        action,
        conversationId: updatedParticipant.conversationId,
        isPinned: updatedParticipant.isPinned,
      });
    } catch (error) {
      // Prisma P2025 error code means Record to update not found
      // We can assume this means the user is not a participant or conversation doesn't exist
      return NextResponse.json(
        { message: "Conversation introuvable ou vous n'êtes pas participant" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error pinning conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
