import { useState } from "react";
import { useConversations } from "./useConversations";
import { useMessages } from "./useMessages";
import { useClubMembers } from "./useClubMembers";
import { useSendMessage } from "./useSendMessage";
import { useCreateConversation } from "./useCreateConversation";
import { useChatWebSocket } from "./useChatWebSocket";
import { useDeleteMessage } from "./useDeleteMessage";
import { usePinConversation } from "./usePinConversation";
import { useBlockUser, useBlockStatus } from "./useBlockUser";
import {
  useUpdateGroup,
  useDeleteGroup,
  useManageMembers,
} from "./useGroupManagement";
import type { Conversation, ClubMember } from "../types";

export function useChatPage(userId: string | undefined) {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data hooks
  const { data: conversationsData, isLoading: conversationsLoading } =
    useConversations();
  const { data: messagesData, isLoading: messagesLoading } = useMessages(
    selectedConversation?.id || null
  );
  const { data: membersData, isLoading: membersLoading } = useClubMembers();

  // Mutation hooks
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();
  const deleteMessage = useDeleteMessage();
  const pinConversation = usePinConversation();
  const blockUser = useBlockUser();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const manageMembers = useManageMembers();

  // Block status
  const otherUserId =
    selectedConversation?.type === "PRIVATE"
      ? selectedConversation.participants?.find((p) => p.id !== userId)?.id
      : undefined;

  const { data: blockStatus } = useBlockStatus(otherUserId);

  // WebSocket
  const { typingUsers, emitTyping, emitStopTyping } = useChatWebSocket(
    userId,
    selectedConversation?.id || null
  );

  // Derived data
  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const clubMembers = membersData?.members || [];

  const filteredConversations = !searchQuery.trim()
    ? conversations
    : conversations.filter((c: Conversation) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Helpers
  const setConvAndShow = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowChat(true);
  };

  const clearConv = () => {
    setSelectedConversation(null);
    setShowChat(false);
  };

  // Handlers
  const handleStartConversation = async (member: ClubMember) => {
    try {
      const r = await createConversation.mutateAsync({
        type: "PRIVATE",
        participantIds: [member.id],
      });
      setConvAndShow({
        id: r.conversation.id,
        type: r.conversation.type,
        name: r.conversation.name,
        participants: r.conversation.participants,
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        updatedAt: new Date().toISOString(),
      });
      setNewConvoOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    try {
      const r = await createConversation.mutateAsync({
        type: "GROUP",
        participantIds: memberIds,
        name,
      });
      setConvAndShow({
        id: r.conversation.id,
        type: r.conversation.type,
        name: r.conversation.name,
        creatorId: userId,
        participants: r.conversation.participants,
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        updatedAt: new Date().toISOString(),
      });
      setNewConvoOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    // State
    selectedConversation,
    setSelectedConversation,
    newConvoOpen,
    setNewConvoOpen,
    showChat,
    setShowChat,
    searchQuery,
    setSearchQuery,
    // Data
    conversations,
    messages,
    clubMembers,
    filteredConversations,
    conversationsLoading,
    messagesLoading,
    membersLoading,
    blockStatus,
    typingUsers,
    otherUserId,
    // Mutations
    sendMessage,
    createConversation,
    deleteMessage,
    pinConversation,
    blockUser,
    updateGroup,
    deleteGroup,
    manageMembers,
    // Handlers
    handleStartConversation,
    handleCreateGroup,
    setConvAndShow,
    clearConv,
    emitTyping,
    emitStopTyping,
  };
}
