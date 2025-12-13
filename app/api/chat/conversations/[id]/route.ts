import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// DELETE /api/chat/conversations/[id] - Delete a group (creator only)
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
        { message: "Seuls les groupes peuvent être supprimés" },
        { status: 400 }
      );
    }

    if (conversation.creatorId !== userId) {
      return NextResponse.json(
        { message: "Seul le créateur peut supprimer le groupe" },
        { status: 403 }
      );
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/chat/conversations/[id] - Rename a group (creator only)
export async function PATCH(
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
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Le nom du groupe est requis" },
        { status: 400 }
      );
    }

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
        { message: "Seuls les groupes peuvent être renommés" },
        { status: 400 }
      );
    }

    if (conversation.creatorId !== userId) {
      return NextResponse.json(
        { message: "Seul le créateur peut renommer le groupe" },
        { status: 403 }
      );
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { name: name.trim() },
      select: { id: true, name: true },
    });

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/chat/conversations/[id] - Get conversation details
export async function GET(
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
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true, isOnline: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation introuvable" },
        { status: 404 }
      );
    }

    // Check user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        creatorId: conversation.creatorId,
        participants: conversation.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          image: p.user.image,
          isOnline: p.user.isOnline,
          role: p.role,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
