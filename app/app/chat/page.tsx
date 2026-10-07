"use client";

import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ConversationSidebar } from "@/features/chat/components/conversation-sidebar";
import { ConversationView } from "@/features/chat/components/conversation-view";
import { useConversations } from "@/features/chat/hooks/use-conversations";

const frame =
  "flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border bg-white shadow-lg dark:bg-zinc-950";

export default function ChatPage() {
  const { data: session } = useSession();
  const myId = session?.user.id;
  const { data: conversations = [], isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Derived from the live list, so a removed conversation closes by itself.
  const selected = conversations.find((c) => c.id === selectedId);

  if (isLoading) {
    return (
      <div className={cn(frame, "items-center justify-center")}>
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={frame}>
      <ConversationSidebar
        className={selected ? "hidden md:flex" : "flex"}
        conversations={conversations}
        myId={myId}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      {selected ? (
        <ConversationView
          conversation={selected}
          key={selected.id}
          myId={myId}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-2 text-muted-foreground md:flex">
          <MessageSquare className="size-10" />
          <p>Sélectionnez une conversation</p>
        </div>
      )}
    </div>
  );
}
