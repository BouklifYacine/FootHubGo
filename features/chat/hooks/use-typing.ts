"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtime } from "@/lib/realtime/realtime-provider";
import { useSocketEvent } from "@/lib/realtime/use-socket-event";

const IDLE_MS = 3_000;

/**
 * Joins the conversation room while it is open: who is typing + `notifyTyping` for the composer.
 * The server only relays typing to sockets it allowed in the room.
 * Key the calling component by conversation id so the typing list resets on switch.
 */
export function useTyping(conversationId: string) {
  const { socket, joinConversation } = useRealtime();
  const [typing, setTyping] = useState<Record<string, string>>({}); // userId -> name
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sentTyping = useRef(false);

  useEffect(() => {
    const leave = joinConversation(conversationId);
    return () => {
      clearTimeout(idleTimer.current);
      sentTyping.current = false; // leaving the room stops "typing" server-side
      leave();
    };
  }, [conversationId, joinConversation]);

  useSocketEvent("chat:typing", ({ conversationId: id, userId, userName, isTyping }) => {
    if (id !== conversationId) return;
    setTyping((current) => {
      const next = { ...current };
      if (isTyping) next[userId] = userName;
      else delete next[userId];
      return next;
    });
  });

  /** Call on every keystroke (`isTyping = false` once the message is sent). */
  const notifyTyping = (isTyping = true) => {
    clearTimeout(idleTimer.current);
    if (sentTyping.current !== isTyping) {
      sentTyping.current = isTyping;
      socket?.emit("chat:typing", { conversationId, isTyping });
    }
    if (isTyping) idleTimer.current = setTimeout(() => notifyTyping(false), IDLE_MS);
  };

  return { typingNames: Object.values(typing), notifyTyping };
}
