import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// POST /api/chat/messages/pin - Pin or unpin a message
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
    const { messageId, action } = body;

    if (!messageId || !action || !["pin", "unpin"].includes(action)) {
      return NextResponse.json(
        { message: "messageId et action (pin/unpin) requis" },
        { status: 400 }
      );
    }

    // Find the message and verify access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { conversationId: true },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message introuvable" },
        { status: 404 }
      );
    }

    // Get the user's participant record
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: message.conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Update pinnedMessageIds array
    let newPinnedIds: string[];

    if (action === "pin") {
      // Add messageId if not already pinned
      newPinnedIds = participant.pinnedMessageIds.includes(messageId)
        ? participant.pinnedMessageIds
        : [...participant.pinnedMessageIds, messageId];
    } else {
      // Remove messageId from pinned list
      newPinnedIds = participant.pinnedMessageIds.filter(
        (id) => id !== messageId
      );
    }

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { pinnedMessageIds: newPinnedIds },
    });

    return NextResponse.json({
      success: true,
      action,
      messageId,
      pinnedMessageIds: newPinnedIds,
    });
  } catch (error) {
    console.error("Error pinning message:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
