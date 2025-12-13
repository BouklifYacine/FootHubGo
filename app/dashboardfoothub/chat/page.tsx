"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

import {
  useConversations,
  useMessages,
  useClubMembers,
  useSendMessage,
  useCreateConversation,
  useChatWebSocket,
  useDeleteMessage,
  usePinConversation,
  useBlockUser,
  useBlockStatus,
  useUpdateGroup,
  useDeleteGroup,
  useManageMembers,
  useDeleteConversation,
  Conversation,
  ClubMember,
  ChatSidebar,
  ChatMainPanel,
} from "@/features/chat";
import { authClient } from "@/lib/auth-client";
import { useProfil } from "@/features/parametres/hooks/useProfil";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function ChatPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? undefined;
  const userName = session?.user?.name || "Moi";
  const { data: userProfile } = useProfil(userId || "");
  const userImage = userProfile?.image || session?.user?.image;

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversationsData, isLoading: conversationsLoading } =
    useConversations();
  const { data: messagesData, isLoading: messagesLoading } = useMessages(
    selectedConversation?.id || null
  );
  const { data: membersData, isLoading: membersLoading } = useClubMembers();

  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();
  const deleteMessage = useDeleteMessage();
  const pinConversation = usePinConversation();
  const blockUser = useBlockUser();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const manageMembers = useManageMembers();
  const deleteConversation = useDeleteConversation();

  const otherUserId = useMemo(() => {
    if (!selectedConversation || selectedConversation.type === "GROUP")
      return undefined;
    return selectedConversation.participants?.find((p) => p.id !== userId)?.id;
  }, [selectedConversation, userId]);

  const { data: blockStatus } = useBlockStatus(otherUserId);
  const { typingUsers, emitTyping, emitStopTyping, emitRead } =
    useChatWebSocket(userId, selectedConversation?.id || null);

  // Emit read receipt when messages are marked as read
  useEffect(() => {
    if (messagesData?.markedAsRead && selectedConversation?.id) {
      emitRead(selectedConversation.id, messagesData.markedAsRead.readAt);
    }
  }, [messagesData?.markedAsRead, selectedConversation?.id, emitRead]);

  const conversations = useMemo(
    () => conversationsData?.conversations || [],
    [conversationsData]
  );
  const messages = useMemo(() => messagesData?.messages || [], [messagesData]);
  const clubMembers = useMemo(() => membersData?.members || [], [membersData]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const pinnedConversations = useMemo(
    () => filteredConversations.filter((c) => c.isPinned),
    [filteredConversations]
  );
  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((c) => !c.isPinned),
    [filteredConversations]
  );

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    setShowChat(true);
  }, []);

  const handleStartConversation = useCallback(
    async (member: ClubMember) => {
      try {
        const result = await createConversation.mutateAsync({
          type: "PRIVATE",
          participantIds: [member.id],
        });
        setSelectedConversation({
          id: result.conversation.id,
          type: result.conversation.type,
          name: result.conversation.name,
          participants: result.conversation.participants,
          lastMessage: null,
          unreadCount: 0,
          isPinned: false,
          updatedAt: new Date().toISOString(),
        });
        setNewConvoOpen(false);
        setShowChat(true);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    },
    [createConversation]
  );

  const handleCreateGroup = useCallback(
    async (name: string, memberIds: string[]) => {
      try {
        const result = await createConversation.mutateAsync({
          type: "GROUP",
          participantIds: memberIds,
          name,
        });
        setSelectedConversation({
          id: result.conversation.id,
          type: result.conversation.type,
          name: result.conversation.name,
          creatorId: userId,
          participants: result.conversation.participants,
          lastMessage: null,
          unreadCount: 0,
          isPinned: false,
          updatedAt: new Date().toISOString(),
        });
        setNewConvoOpen(false);
        setShowChat(true);
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    },
    [createConversation, userId]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation) return;
      try {
        await sendMessage.mutateAsync({
          conversationId: selectedConversation.id,
          content,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [selectedConversation, sendMessage]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string, type: "forMe" | "forAll") => {
      if (!selectedConversation) return;
      deleteMessage.mutate({
        messageId,
        conversationId: selectedConversation.id,
        type,
      });
    },
    [deleteMessage, selectedConversation]
  );

  const handlePinConversation = useCallback(
    (action: "pin" | "unpin") => {
      if (!selectedConversation) return;
      pinConversation.mutate({
        conversationId: selectedConversation.id,
        action,
      });
    },
    [pinConversation, selectedConversation]
  );

  const handleBlockUser = useCallback(
    (action: "block" | "unblock") => {
      if (!otherUserId) return;
      blockUser.mutate({ userId: otherUserId, action });
    },
    [blockUser, otherUserId]
  );

  const handleRenameGroup = useCallback(
    (name: string) => {
      if (!selectedConversation) return;
      setSelectedConversation((prev) => (prev ? { ...prev, name } : null));
      updateGroup.mutate({ conversationId: selectedConversation.id, name });
    },
    [selectedConversation, updateGroup]
  );

  const handleKickMember = useCallback(
    (targetUserId: string) => {
      if (!selectedConversation) return;
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter(
                (p) => p.id !== targetUserId
              ),
            }
          : null
      );
      manageMembers.mutate({
        conversationId: selectedConversation.id,
        targetUserId,
        action: "kick",
      });
    },
    [selectedConversation, manageMembers]
  );

  const handleLeaveGroup = useCallback(() => {
    if (!selectedConversation || !userId) return;
    manageMembers.mutate({
      conversationId: selectedConversation.id,
      targetUserId: userId,
      action: "leave",
    });
    setSelectedConversation(null);
    setShowChat(false);
  }, [selectedConversation, userId, manageMembers]);

  const handleDeleteGroup = useCallback(() => {
    if (!selectedConversation) return;
    deleteGroup.mutate({ conversationId: selectedConversation.id });
    setSelectedConversation(null);
    setShowChat(false);
  }, [selectedConversation, deleteGroup]);

  const handleAddMembers = useCallback(
    (memberIds: string[]) => {
      if (!selectedConversation) return;
      const newMembers = clubMembers.filter((m) => memberIds.includes(m.id));
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              participants: [
                ...prev.participants,
                ...newMembers.map((m) => ({
                  id: m.id,
                  name: m.name,
                  image: m.image,
                  isOnline: false,
                })),
              ],
            }
          : null
      );
      manageMembers.mutate({
        conversationId: selectedConversation.id,
        memberIds,
        action: "add",
      });
    },
    [selectedConversation, clubMembers, manageMembers]
  );

  const handleBack = useCallback(() => {
    setShowChat(false);
  }, []);

  const handleDeleteConversation = useCallback(() => {
    if (!selectedConversation) return;
    deleteConversation.mutate(selectedConversation.id);
    setSelectedConversation(null);
    setShowChat(false);
  }, [selectedConversation, deleteConversation]);

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <ChatSidebar
        conversations={{
          pinned: pinnedConversations,
          unpinned: unpinnedConversations,
        }}
        selectedConversationId={selectedConversation?.id || null}
        userId={userId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={handleSelectConversation}
        newConvoOpen={newConvoOpen}
        onNewConvoOpenChange={setNewConvoOpen}
        clubMembers={clubMembers}
        onStartConversation={handleStartConversation}
        onCreateGroup={handleCreateGroup}
        membersLoading={membersLoading}
        isCreating={createConversation.isPending}
        showChat={showChat}
      />

      <ChatMainPanel
        conversation={selectedConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        typingUsers={typingUsers}
        userId={userId}
        userName={userName}
        userImage={userImage ?? undefined}
        blockStatus={blockStatus}
        clubMembers={clubMembers}
        isSending={sendMessage.isPending}
        isGroupUpdating={
          updateGroup.isPending ||
          deleteGroup.isPending ||
          manageMembers.isPending
        }
        isRateLimited={sendMessage.isRateLimited}
        onClearRateLimit={sendMessage.clearRateLimit}
        showChat={showChat}
        onSendMessage={handleSendMessage}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        onDeleteMessage={handleDeleteMessage}
        onBack={handleBack}
        onPinConversation={handlePinConversation}
        onBlockUser={handleBlockUser}
        onRenameGroup={handleRenameGroup}
        onKickMember={handleKickMember}
        onLeaveGroup={handleLeaveGroup}
        onDeleteGroup={handleDeleteGroup}
        onDeleteConversation={handleDeleteConversation}
        onAddMembers={handleAddMembers}
      />
    </div>
  );
}
