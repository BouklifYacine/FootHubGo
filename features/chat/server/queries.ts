import { prisma } from "@/prisma";
import { findMembership } from "@/lib/auth/session";
import { requireParticipant } from "./access";
import {
  conversationInclude,
  messageInclude,
  toConversationDto,
  toMessageDto,
  type BlockLists,
} from "./dto";
import { ensureClubChannelMembership, ensureTeamChannelMembership } from "./team-conversation";

export const MESSAGES_PAGE_SIZE = 50;

/** The user's conversations (club and section channels included), most recently active first. */
export async function getConversations(userId: string) {
  const membership = await findMembership(userId);
  if (membership) {
    await ensureClubChannelMembership(userId, membership.clubId);
    for (const section of membership.sections) await ensureTeamChannelMembership(userId, section.teamId);
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: conversationInclude(userId),
    orderBy: { updatedAt: "desc" },
  });

  // One grouped query for every unread counter (messages from others since my last read)
  const unread = await prisma.message.groupBy({
    by: ["conversationId"],
    _count: { _all: true },
    where: {
      senderId: { not: userId },
      deletedForAll: false,
      deletions: { none: { userId } },
      OR: conversations.map((conversation) => {
        const me = conversation.participants.find((participant) => participant.userId === userId);
        return { conversationId: conversation.id, createdAt: { gt: me?.lastReadAt ?? me?.joinedAt } };
      }),
    },
  });
  const unreadById = new Map(unread.map((row) => [row.conversationId, row._count._all]));

  const blocks = await getBlockLists(userId);
  return conversations.map((conversation) =>
    toConversationDto(conversation, userId, { unreadCount: unreadById.get(conversation.id) ?? 0, blocks }),
  );
}

export async function getBlockLists(userId: string): Promise<BlockLists> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { blockedUsers: { select: { id: true } }, blockedBy: { select: { id: true } } },
  });
  return {
    blocked: new Set(user?.blockedUsers.map((u) => u.id)),
    blockedBy: new Set(user?.blockedBy.map((u) => u.id)),
  };
}

/**
 * One page of messages, newest page first (cursor = oldest message id of the previous page).
 * Messages inside a page are in chronological order.
 */
export async function getMessagesPage(userId: string, conversationId: string, cursor?: string) {
  await requireParticipant(userId, conversationId);

  const rows = await prisma.message.findMany({
    where: { conversationId, deletions: { none: { userId } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MESSAGES_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: messageInclude,
  });

  const page = rows.slice(0, MESSAGES_PAGE_SIZE); // newest first
  const hasOlder = rows.length > MESSAGES_PAGE_SIZE;
  return {
    messages: page.toReversed().map(toMessageDto),
    nextCursor: hasOlder ? (page.at(-1)?.id ?? null) : null,
  };
}

export type MessagesPage = Awaited<ReturnType<typeof getMessagesPage>>;
