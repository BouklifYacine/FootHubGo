import type { Prisma } from "@/generated/prisma/client";
import type { ConversationDto, MessageDto } from "@/lib/realtime/protocol";

export const messageInclude = {
  sender: { select: { name: true, image: true } },
} satisfies Prisma.MessageInclude;

type MessageWithSender = Prisma.MessageGetPayload<{ include: typeof messageInclude }>;

export function toMessageDto(message: MessageWithSender): MessageDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.deletedForAll ? "" : message.content,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderImage: message.sender.image,
    createdAt: message.createdAt.toISOString(),
    read: message.read,
    deletedForAll: message.deletedForAll,
  };
}

/** Everything `toConversationDto` needs, as seen by `userId` (hides messages they deleted). */
export function conversationInclude(userId: string) {
  return {
    participants: {
      orderBy: { joinedAt: "asc" },
      include: { user: { select: { id: true, name: true, image: true, isOnline: true } } },
    },
    messages: {
      where: { deletions: { none: { userId } } },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: messageInclude,
    },
  } satisfies Prisma.ConversationInclude;
}

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: ReturnType<typeof conversationInclude>;
}>;

/** Ids of the users the viewer blocks / is blocked by (see `getBlockLists`). */
export type BlockLists = { blocked: Set<string>; blockedBy: Set<string> };

export function toConversationDto(
  conversation: ConversationWithRelations,
  userId: string,
  { unreadCount = 0, blocks }: { unreadCount?: number; blocks?: BlockLists } = {},
): ConversationDto {
  const me = conversation.participants.find((participant) => participant.userId === userId);
  const other = conversation.participants.find((participant) => participant.userId !== userId);
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    type: conversation.type,
    name:
      conversation.type === "PRIVATE"
        ? (other?.user.name ?? "Conversation")
        : (conversation.name ?? "Groupe"),
    participants: conversation.participants.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
      image: participant.user.image,
      isOnline: participant.user.isOnline,
      role: participant.role,
    })),
    lastMessage: lastMessage ? toMessageDto(lastMessage) : null,
    unreadCount,
    isPinned: me?.isPinned ?? false,
    myRole: me?.role ?? "MEMBER",
    blocked:
      conversation.type === "PRIVATE" && other
        ? {
            byMe: blocks?.blocked.has(other.userId) ?? false,
            byThem: blocks?.blockedBy.has(other.userId) ?? false,
          }
        : null,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}
