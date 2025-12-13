import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { message: "conversationId requis" },
      { status: 400 }
    );
  }

  try {
    // Verify user is a participant and get their pinned messages
    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Get all messages with their deletion records
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        deletions: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Filter out messages deleted for this user, transform the rest
    const transformedMessages = messages
      .filter((msg) => msg.deletions.length === 0) // Exclude messages deleted for me
      .map((msg) => ({
        id: msg.id,
        content: msg.deletedForAll ? "" : msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderImage: msg.sender.image,
        createdAt: msg.createdAt.toISOString(),
        read: msg.read,
        readAt: msg.readAt?.toISOString() || null,
        deletedForAll: msg.deletedForAll,
        isPinned: participation.pinnedMessageIds.includes(msg.id),
      }));

    // Update last read time for the user
    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      messages: transformedMessages,
      conversationId,
      pinnedMessageIds: participation.pinnedMessageIds,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  // Rate Limit Check: Max 15 messages per minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentMessagesCount = await prisma.message.count({
    where: {
      senderId: userId,
      createdAt: { gt: oneMinuteAgo },
    },
  });

  if (recentMessagesCount >= 15) {
    return NextResponse.json(
      { message: "Vous envoyez trop de messages. Veuillez ralentir." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { message: "conversationId et content requis" },
        { status: 400 }
      );
    }

    // Verify user is a participant using count (faster)
    const participationCount = await prisma.conversationParticipant.count({
      where: {
        userId,
        conversationId,
      },
    });

    if (participationCount === 0) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Create the message and update conversation timestamp atomically
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content: content.trim(),
          senderId: userId,
          conversationId,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Get all participants to notify via WebSocket (except sender)
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: userId },
      },
      select: { userId: true },
    });

    // TODO: Emit WebSocket event to participants
    // This would be handled by a separate WebSocket server or Socket.IO integration

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: userName,
        senderImage: userImage,
        createdAt: message.createdAt.toISOString(),
        read: message.read,
        readAt: null,
        conversationId: message.conversationId,
      },
      recipientIds: participants.map((p) => p.userId),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
