"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import {
  UNAUTHORIZED_ERROR,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "./protocol";

export type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type RealtimeContextValue = {
  socket: RealtimeSocket | null;
  connected: boolean;
  /** Joins a conversation room for as long as the returned cleanup is not called. Survives reconnects. */
  joinConversation: (conversationId: string) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const MAX_RETRY_DELAY_MS = 30_000;

function createSocket(): RealtimeSocket {
  return io({
    autoConnect: false,
    withCredentials: true,
    // Transport errors: Socket.IO retries forever with a capped exponential backoff.
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: MAX_RETRY_DELAY_MS,
  });
}

/**
 * ONE socket per tab, shared by every realtime hook (notifications, chat).
 * Mounted once in the root layout; it only connects when a user is signed in
 * (the server authenticates the socket with the session cookie, never with this id).
 */
export function RealtimeProvider({ userId, children }: { userId?: string | null; children: ReactNode }) {
  const queryClient = useQueryClient();
  // A new socket per signed-in user (sign out / sign in as someone else drops the old one).
  const socket = useMemo(() => (userId && typeof window !== "undefined" ? createSocket() : null), [userId]);
  const [connected, setConnected] = useState(false);
  /** conversationId -> number of components that want to be in the room */
  const rooms = useRef(new Map<string, number>());

  useEffect(() => {
    if (!socket) return;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1_000;
    let wasDisconnected = false;

    const onConnect = () => {
      setConnected(true);
      retryDelay = 1_000;
      for (const conversationId of rooms.current.keys()) {
        socket.emit("chat:join", conversationId, () => {});
      }
      if (wasDisconnected) {
        // Events may have been missed while offline: refetch what they would have updated.
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        toast.success("Connecté", { id: "realtime-status", duration: 2_000 });
      }
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      setConnected(false);
      if (reason === "io client disconnect") return;
      wasDisconnected = true;
      toast.error("Connexion perdue, reconnexion…", { id: "realtime-status" });
    };

    // Errors raised by the auth middleware are not retried by Socket.IO (`socket.active` is false).
    const onConnectError = (error: Error) => {
      if (socket.active) return;
      if (error.message === UNAUTHORIZED_ERROR) {
        toast.error("Session expirée, reconnecte-toi", { id: "realtime-status" });
        return;
      }
      retryTimer = setTimeout(() => socket.connect(), retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.connect();

    return () => {
      clearTimeout(retryTimer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
      setConnected(false);
    };
  }, [socket, queryClient]);

  const joinConversation = useCallback(
    (conversationId: string) => {
      const count = rooms.current.get(conversationId) ?? 0;
      rooms.current.set(conversationId, count + 1);
      if (count === 0 && socket?.connected) socket.emit("chat:join", conversationId, () => {});

      return () => {
        const remaining = (rooms.current.get(conversationId) ?? 1) - 1;
        if (remaining > 0) return void rooms.current.set(conversationId, remaining);
        rooms.current.delete(conversationId);
        if (socket?.connected) socket.emit("chat:leave", conversationId);
      };
    },
    [socket],
  );

  return (
    <RealtimeContext.Provider value={{ socket, connected, joinConversation }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error("useRealtime must be used inside <RealtimeProvider>");
  return context;
}
