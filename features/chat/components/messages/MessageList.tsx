"use client";

import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "../../types";
import { MessageBubble } from "../MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyMessages } from "./EmptyMessages";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userId: string | undefined;
  userName: string;
  userImage: string | undefined;
  isGroup: boolean;
  conversationId: string;
  typingUsers: string[];
  onDeleteMessage: (messageId: string, type: "forMe" | "forAll") => void;
}

export function MessageList({
  messages,
  isLoading,
  userId,
  userName,
  userImage,
  isGroup,
  conversationId,
  typingUsers,
  onDeleteMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyMessages />;
  }

  return (
    <>
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === userId}
            userName={userName}
            userImage={userImage}
            isGroup={isGroup}
            conversationId={conversationId}
            onDelete={onDeleteMessage}
          />
        ))}
      </div>

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <TypingIndicator
          userName={
            typingUsers.length > 1
              ? `${typingUsers.join(", ")} écrivent`
              : typingUsers[0]
          }
        />
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
