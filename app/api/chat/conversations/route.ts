import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// GET /api/chat/conversations - Get all conversations for current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                isOnline: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform data for frontend
    const transformedConversations = conversations.map((conv) => {
      const myParticipation = conv.participants.find(
        (p) => p.userId === userId
      );
      const lastMessage = conv.messages[0];

      // Count unread messages
      const unreadCount = conv.messages.filter(
        (m) => !m.read && m.senderId !== userId
      ).length;

      return {
        id: conv.id,
        type: conv.type,
        name:
          conv.type === "GROUP"
            ? conv.name
            : conv.participants.find((p) => p.userId !== userId)?.user.name ||
              "Conversation",
        participants: conv.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          image: p.user.image,
          isOnline: p.user.isOnline,
        })),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: lastMessage.sender.name,
              senderImage: lastMessage.sender.image,
              createdAt: lastMessage.createdAt.toISOString(),
              read: lastMessage.read,
              readAt: lastMessage.readAt?.toISOString() || null,
            }
          : null,
        unreadCount,
        isPinned: myParticipation?.isPinned || false,
        updatedAt: conv.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ conversations: transformedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/chat/conversations - Create a new conversation
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
    const { type, participantIds, name } = body;

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { message: "Au moins un participant requis" },
        { status: 400 }
      );
    }

    // For private chats, check if conversation already exists
    if (type === "PRIVATE" && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "PRIVATE",
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: participantIds[0] } } },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      });

      if (existingConversation) {
        return NextResponse.json({
          conversation: {
            id: existingConversation.id,
            type: existingConversation.type,
            name: existingConversation.participants.find(
              (p) => p.userId !== userId
            )?.user.name,
            participants: existingConversation.participants.map((p) => ({
              id: p.user.id,
              name: p.user.name,
              image: p.user.image,
            })),
          },
          existed: true,
        });
      }
    }

    // Create new conversation
    const allParticipantIds = [...new Set([userId, ...participantIds])];

    const conversation = await prisma.conversation.create({
      data: {
        type: type || "PRIVATE",
        name: type === "GROUP" ? name : null,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        type: conversation.type,
        name:
          conversation.type === "GROUP"
            ? conversation.name
            : conversation.participants.find((p) => p.userId !== userId)?.user
                .name,
        participants: conversation.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          image: p.user.image,
        })),
      },
      existed: false,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
