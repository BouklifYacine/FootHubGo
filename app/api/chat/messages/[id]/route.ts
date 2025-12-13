import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// DELETE /api/chat/messages/[id]?type=forMe|forAll
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const { id: messageId } = await params;
  const { searchParams } = new URL(request.url);
  const deleteType = searchParams.get("type") || "forMe";

  if (!messageId) {
    return NextResponse.json(
      { message: "ID du message requis" },
      { status: 400 }
    );
  }

  try {
    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message introuvable" },
        { status: 404 }
      );
    }

    // Verify user is a participant in this conversation
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    if (deleteType === "forAll") {
      // Only the sender can delete for everyone
      if (message.senderId !== userId) {
        return NextResponse.json(
          { message: "Seul l'expéditeur peut supprimer pour tous" },
          { status: 403 }
        );
      }

      // Mark message as deleted for all
      await prisma.message.update({
        where: { id: messageId },
        data: { deletedForAll: true },
      });

      return NextResponse.json({
        success: true,
        type: "forAll",
        messageId,
      });
    } else {
      // Delete for me - create a MessageDeletion record
      await prisma.messageDeletion.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId,
          },
        },
        create: {
          messageId,
          userId,
        },
        update: {
          deletedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        type: "forMe",
        messageId,
      });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
