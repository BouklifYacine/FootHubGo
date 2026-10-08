"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { LoadingState } from "@/components/app/loading-state";
import { useSession } from "@/lib/auth-client";
import { ConversationSidebar } from "@/features/chat/components/conversation-sidebar";
import { ConversationView } from "@/features/chat/components/conversation-view";
import { useConversations } from "@/features/chat/hooks/use-conversations";

/**
 * Full-height chat (the shell gives this page the height between the top bar and the bottom tabs,
 * in dynamic viewport units, so the composer never slides under the browser toolbar).
 */
export default function ChatPage() {
  const { data: session } = useSession();
  const myId = session?.user.id;
  const { data: conversations = [], isLoading } = useConversations();
  // `?c=<id>` opens a conversation (push notification of a message). Read once: the list is still
  // loading on the server render, so this never changes the hydrated markup.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("c"),
  );
  // Derived from the live list, so a removed conversation closes by itself.
  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background md:rounded-2xl md:border">
      <h1 className="sr-only">Messages</h1>
      {isLoading ? (
        <LoadingState rows={5} className="p-4" />
      ) : (
        <>
          <ConversationSidebar
            className={selected ? "hidden md:flex" : "flex"}
            conversations={conversations}
            myId={myId}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
          {selected ? (
            <ConversationView conversation={selected} key={selected.id} myId={myId} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="hidden flex-1 flex-col items-center justify-center gap-2 text-muted-foreground md:flex">
              <MessageSquare className="size-10" aria-hidden />
              <p>Choisis une conversation</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
