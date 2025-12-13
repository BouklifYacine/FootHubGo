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
    // Find the message AND verify participation in one query
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: { userId },
          },
        },
      },
      select: {
        senderId: true,
      },
    });

    if (!message) {
      // Either message doesn't exist OR user is not a participant
      // We return 404 to be safe and not leak existence
      return NextResponse.json(
        { message: "Message introuvable ou accès refusé" },
        { status: 404 }
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
