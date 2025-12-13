"use client";

import { useState } from "react";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Plus,
  Users,
  User,
  Pin,
  MessageSquare,
  LogOut,
  BellOff,
  Ban,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { cn } from "@/lib/utils";

// Type for conversation
type Conversation = {
  id: string;
  type: "private" | "group";
  name: string;
  image: string | null;
  participants?: { name: string; image: string | null }[];
  lastMessage: string;
  timestamp: string;
  unread: number;
  isPinned?: boolean;
};

// Mock data for UI design
const mockConversations: Conversation[] = [
  // Pinned conversations
  {
    id: "pinned-1",
    type: "group",
    name: "Équipe U19",
    image: null,
    participants: [
      { name: "Lucas Martin", image: null },
      { name: "Emma Dupont", image: null },
      { name: "Thomas Bernard", image: null },
      { name: "Julie Moreau", image: null },
      { name: "Marc Lefebvre", image: null },
    ],
    lastMessage: "Coach: On se retrouve à 17h !",
    timestamp: "15:00",
    unread: 5,
    isPinned: true,
  },
  // Regular conversations
  {
    id: "1",
    type: "private",
    name: "Lucas Martin",
    image: null,
    lastMessage: "On se retrouve à 18h pour l'entraînement ?",
    timestamp: "14:32",
    unread: 2,
    isPinned: false,
  },
  {
    id: "2",
    type: "private",
    name: "Emma Dupont",
    image: null,
    lastMessage: "Parfait, à demain !",
    timestamp: "12:15",
    unread: 0,
    isPinned: false,
  },
  {
    id: "group-1",
    type: "group",
    name: "Défenseurs",
    image: null,
    participants: [
      { name: "Thomas Bernard", image: null },
      { name: "Julie Moreau", image: null },
      { name: "Marc Lefebvre", image: null },
    ],
    lastMessage: "Thomas: Qui prend les corners samedi ?",
    timestamp: "11:45",
    unread: 0,
    isPinned: false,
  },
  {
    id: "3",
    type: "private",
    name: "Thomas Bernard",
    image: null,
    lastMessage: "Tu as vu le message du coach ?",
    timestamp: "Hier",
    unread: 0,
    isPinned: false,
  },
];

const mockMessages = [
  {
    id: "1",
    content: "Salut ! Tu es dispo pour l'entraînement de demain ?",
    senderId: "other",
    senderName: "Lucas Martin",
    timestamp: "14:20",
  },
  {
    id: "2",
    content: "Oui bien sûr, à quelle heure ?",
    senderId: "me",
    senderName: "Moi",
    timestamp: "14:25",
  },
  {
    id: "3",
    content: "On se retrouve à 18h pour l'entraînement ?",
    senderId: "other",
    senderName: "Lucas Martin",
    timestamp: "14:32",
  },
];

// Mock team members for new conversation modal
const mockTeamMembers = [
  { id: "1", name: "Lucas Martin", image: null },
  { id: "2", name: "Emma Dupont", image: null },
  { id: "3", name: "Thomas Bernard", image: null },
  { id: "4", name: "Julie Moreau", image: null },
  { id: "5", name: "Marc Lefebvre", image: null },
];

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view

  const pinnedConversations = mockConversations.filter((c) => c.isPinned);
  const allConversations = mockConversations.filter((c) => !c.isPinned);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: messageInput,
        senderId: "me",
        senderName: "Moi",
        timestamp: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessageInput("");
  };

  // Render a conversation item
  const renderConversationItem = (conv: Conversation) => (
    <div
      key={conv.id}
      onClick={() => {
        setSelectedConversation(conv);
        setShowChat(true);
      }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
        selectedConversation?.id === conv.id
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
      )}
    >
      <div className="relative">
        {conv.type === "group" ? (
          // Group avatar - stacked avatars
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-950">
              {conv.participants?.[0]?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-950">
              +{(conv.participants?.length || 1) - 1}
            </div>
          </div>
        ) : (
          <>
            <AvatarSimple
              alt={conv.name}
              src={conv.image || ""}
              Fallback={conv.name.substring(0, 2).toUpperCase()}
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-950" />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {conv.type === "group" && (
              <Users className="h-3 w-3 text-zinc-400" />
            )}
            <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {conv.name}
            </p>
          </div>
          <span className="text-xs text-zinc-400">{conv.timestamp}</span>
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {conv.lastMessage}
        </p>
      </div>

      {conv.unread > 0 && (
        <div className="shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">
            {conv.unread}
          </span>
        </div>
      )}
    </div>
  );

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
            {/* New Conversation Button */}
            <Dialog open={newConvoOpen} onOpenChange={setNewConvoOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Nouvelle conversation
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <User className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">Message privé</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Users className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">Groupe</span>
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Rechercher un membre..."
                      className="pl-10"
                    />
                  </div>

                  {/* Team members list */}
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {mockTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <AvatarSimple
                          alt={member.name}
                          src={member.image || ""}
                          Fallback={member.name.substring(0, 2).toUpperCase()}
                        />
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">
                          {member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher..."
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
              {pinnedConversations.map(renderConversationItem)}
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
            {allConversations.map(renderConversationItem)}
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
        {/* Chat Header */}
        <div className="h-16 px-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg md:hidden"
              onClick={() => setShowChat(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {selectedConversation?.type === "group" ? (
              // Group header with stacked avatars
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {selectedConversation.participants
                    ?.slice(0, 3)
                    .map((p, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900"
                      >
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  {(selectedConversation.participants?.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900">
                      +{(selectedConversation.participants?.length || 0) - 3}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedConversation ? (
              <AvatarSimple
                alt={selectedConversation.name}
                src={selectedConversation.image || ""}
                Fallback={selectedConversation.name
                  .substring(0, 2)
                  .toUpperCase()}
              />
            ) : null}
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {selectedConversation?.name}
              </p>
              <p className="text-xs text-green-500 font-medium">
                {selectedConversation?.type === "group"
                  ? `${selectedConversation?.participants?.length} participants`
                  : "En ligne"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Phone className="h-4 w-4 text-zinc-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Video className="h-4 w-4 text-zinc-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  <span>Partir</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <BellOff className="h-4 w-4" />
                  <span>Mettre en sourdine</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <Ban className="h-4 w-4" />
                  <span>Bloquer</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-red-600">
                  <Flag className="h-4 w-4" />
                  <span>Signaler</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-1.5 group",
                  msg.senderId === "me" ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar for other user */}
                {msg.senderId !== "me" && (
                  <AvatarSimple
                    alt={msg.senderName}
                    src=""
                    Fallback={msg.senderName.substring(0, 2).toUpperCase()}
                  />
                )}

                {/* Message bubble with more options */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5">
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl",
                        msg.senderId === "me"
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-md"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
                      )}
                    >
                      {/* Show sender name in group chats */}
                      {selectedConversation?.type === "group" &&
                        msg.senderId !== "me" && (
                          <p className="text-[10px] font-semibold text-primary mb-1">
                            {msg.senderName}
                          </p>
                        )}
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          msg.senderId === "me"
                            ? "text-white/70"
                            : "text-zinc-400"
                        )}
                      >
                        {msg.timestamp}
                      </p>
                    </div>

                    {/* More options button (visible on hover) - only for other messages */}
                    {msg.senderId !== "me" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                    )}
                  </div>

                  {/* Avatar for my messages - UNDER the message */}
                  {msg.senderId === "me" && (
                    <div className="scale-75 -mt-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        ME
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              <Send size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
