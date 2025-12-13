import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

const MAX_GROUP_MEMBERS = 30;

// POST /api/chat/conversations/[id]/members - Add members to group (creator only)
export async function POST(
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

  const { id: conversationId } = await params;

  try {
    const body = await request.json();
    const { memberIds } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { message: "Liste de membres requise" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation introuvable" },
        { status: 404 }
      );
    }

    if (conversation.type !== "GROUP") {
      return NextResponse.json(
        {
          message: "Impossible d'ajouter des membres à une conversation privée",
        },
        { status: 400 }
      );
    }

    if (conversation.creatorId !== userId) {
      return NextResponse.json(
        { message: "Seul le créateur peut ajouter des membres" },
        { status: 403 }
      );
    }

    // Check member limit
    const currentCount = conversation.participants.length;
    const newTotal = currentCount + memberIds.length;

    if (newTotal > MAX_GROUP_MEMBERS) {
      return NextResponse.json(
        {
          message: `Un groupe ne peut pas avoir plus de ${MAX_GROUP_MEMBERS} membres`,
        },
        { status: 400 }
      );
    }

    // Filter out already existing members
    const existingIds = new Set(conversation.participants.map((p) => p.userId));
    const newMemberIds = memberIds.filter((id: string) => !existingIds.has(id));

    if (newMemberIds.length === 0) {
      return NextResponse.json(
        { message: "Tous les membres sont déjà dans le groupe" },
        { status: 400 }
      );
    }

    // Add new members
    await prisma.conversationParticipant.createMany({
      data: newMemberIds.map((memberId: string) => ({
        userId: memberId,
        conversationId,
        role: "MEMBER",
      })),
    });

    return NextResponse.json({
      success: true,
      addedCount: newMemberIds.length,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/chat/conversations/[id]/members - Remove member (kick or leave)
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

  const { id: conversationId } = await params;
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ message: "userId requis" }, { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { creatorId: true, type: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation introuvable" },
        { status: 404 }
      );
    }

    if (conversation.type !== "GROUP") {
      return NextResponse.json(
        { message: "Action non disponible pour les conversations privées" },
        { status: 400 }
      );
    }

    const isCreator = conversation.creatorId === userId;
    const isSelf = targetUserId === userId;

    // Only creator can kick others, anyone can leave (self)
    if (!isSelf && !isCreator) {
      return NextResponse.json(
        { message: "Seul le créateur peut expulser des membres" },
        { status: 403 }
      );
    }

    // Creator cannot leave (must delete group instead)
    if (isSelf && isCreator) {
      return NextResponse.json(
        {
          message:
            "Le créateur ne peut pas quitter le groupe. Supprimez-le à la place.",
        },
        { status: 400 }
      );
    }

    // Remove participant
    await prisma.conversationParticipant.delete({
      where: {
        userId_conversationId: {
          userId: targetUserId,
          conversationId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      action: isSelf ? "left" : "kicked",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
