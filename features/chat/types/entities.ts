// Core entity types for chat feature

export type ConversationType = "PRIVATE" | "GROUP";
export type ParticipantRole = "ADMIN" | "MEMBER";

export interface Participant {
  id: string;
  name: string;
  image: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  role?: ParticipantRole;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  deletedForAll?: boolean;
  isPinned?: boolean;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  creatorId?: string | null;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  name: string;
  image: string | null;
  role: string;
  poste: string | null;
}
