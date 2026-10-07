"use client";

import { useEffect, useEffectEvent } from "react";
import type { ServerToClientEvents } from "./protocol";
import { useRealtime } from "./realtime-provider";

/**
 * Subscribes to a server event for the lifetime of the component.
 * The handler always sees the latest props/state (no stale closures) without re-subscribing.
 *
 * useSocketEvent("chat:message", (message) => { ... });
 */
export function useSocketEvent<E extends keyof ServerToClientEvents>(
  event: E,
  handler: ServerToClientEvents[E],
) {
  type Listener = (...args: Parameters<ServerToClientEvents[E]>) => void;
  const { socket } = useRealtime();
  const onEvent = useEffectEvent((...args: Parameters<ServerToClientEvents[E]>) =>
    (handler as Listener)(...args),
  );

  useEffect(() => {
    if (!socket) return;
    const listener: Listener = (...args) => onEvent(...args);
    // Socket.IO's typed `on` can't infer the listener of a generic event name.
    const target = socket as unknown as {
      on: (event: E, listener: Listener) => void;
      off: (event: E, listener: Listener) => void;
    };
    target.on(event, listener);
    return () => target.off(event, listener);
  }, [socket, event]);
}
