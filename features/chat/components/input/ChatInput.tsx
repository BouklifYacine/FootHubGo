"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { SendButton } from "./SendButton";

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  isLoading,
  placeholder = "Écrivez un message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      onStopTyping?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Typing indicator logic
    onTyping?.();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
    >
      <div className="flex items-center gap-2">
        <EmojiPickerButton onSelect={handleEmojiSelect} disabled={disabled} />
        <Input
          value={message}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none h-10 rounded-xl"
          disabled={disabled}
        />
        <SendButton
          disabled={!message.trim() || disabled}
          isLoading={isLoading}
        />
      </div>
    </form>
  );
}
