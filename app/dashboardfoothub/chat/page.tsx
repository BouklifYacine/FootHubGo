"use client";

import { useState, useMemo, useCallback } from "react";
import { Send, Search, Plus, Pin, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  Conversation,
  ClubMember,
  ConversationItem,
  MessageBubble,
  ChatHeader,
  NewConversationDialog,
} from "@/features/chat";
import { authClient } from "@/lib/auth-client";
import { useProfil } from "@/features/parametres/hooks/useProfil";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function ChatPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? undefined;
  const userName = session?.user?.name || "Moi";

  // Fetch fresh profile data to keep avatar synced with sidebar
  const { data: userProfile } = useProfil(userId || "");
  const userImage = userProfile?.image || session?.user?.image;

  // State
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks
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

  // WebSocket for real-time updates
  useChatWebSocket(userId, selectedConversation?.id || null);

  // Memoized data
  const conversations = useMemo(
    () => conversationsData?.conversations || [],
    [conversationsData]
  );
  const messages = useMemo(() => messagesData?.messages || [], [messagesData]);
  const clubMembers = useMemo(() => membersData?.members || [], [membersData]);

  // Filter conversations by search query
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
  const allConversations = useMemo(
    () => filteredConversations.filter((c) => !c.isPinned),
    [filteredConversations]
  );

  // Callbacks
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation.id,
        content: messageInput,
      });
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [messageInput, selectedConversation, sendMessage]);

  const handleStartConversation = useCallback(
    async (member: ClubMember) => {
      try {
        const result = await createConversation.mutateAsync({
          type: "PRIVATE",
          participantIds: [member.id],
        });

        setSelectedConversation({
          ...result.conversation,
          name: member.name,
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

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    setShowChat(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowChat(false);
  }, []);

  // Loading state
  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
      {/* Left Panel - Conversation List */}
      <div
        className={cn(
          "border-r border-zinc-200 dark:border-zinc-800 flex flex-col",
          "w-full md:w-80",
          showChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Messages
            </h2>
            <NewConversationDialog
              open={newConvoOpen}
              onOpenChange={setNewConvoOpen}
              members={clubMembers}
              onSelectMember={handleStartConversation}
              isLoading={membersLoading}
              isCreating={createConversation.isPending}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-100 dark:bg-zinc-900 border-none h-10"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned Section */}
          {pinnedConversations.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Pin className="h-3 w-3 text-zinc-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Épinglés
                </span>
              </div>
              {pinnedConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversation?.id === conv.id}
                  userId={userId}
                  onClick={() => handleSelectConversation(conv)}
                />
              ))}
            </div>
          )}

          {/* All Messages Section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <MessageSquare className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Tous les messages
              </span>
            </div>
            {allConversations.length === 0 &&
            pinnedConversations.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-8">
                Aucune conversation. Cliquez sur + pour en créer une.
              </p>
            ) : (
              allConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversation?.id === conv.id}
                  userId={userId}
                  onClick={() => handleSelectConversation(conv)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showChat ? "flex" : "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              userId={userId}
              onBack={handleBack}
              onPinConversation={(action) => {
                // Optimistically update local state so the UI reflects the change immediately
                setSelectedConversation((prev) =>
                  prev ? { ...prev, isPinned: action === "pin" } : null
                );

                pinConversation.mutate({
                  conversationId: selectedConversation.id,
                  action,
                });
              }}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p>Aucun message. Dites bonjour !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderId === userId}
                      userName={userName}
                      userImage={userImage || ""}
                      isGroup={selectedConversation.type === "GROUP"}
                      conversationId={selectedConversation.id}
                      onDelete={(messageId, type) => {
                        deleteMessage.mutate({
                          messageId,
                          conversationId: selectedConversation.id,
                          type,
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl"
                  disabled={sendMessage.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                  disabled={sendMessage.isPending || !messageInput.trim()}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send size={24} />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Sélectionnez une conversation</p>
            <p className="text-sm">ou créez-en une nouvelle</p>
          </div>
        )}
      </div>
    </div>
  );
}
