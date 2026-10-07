"use client";

import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendMessage } from "../hooks/use-send-message";
import { MESSAGE_MAX_LENGTH } from "../schemas";

type Props = { conversationId: string; disabledReason?: string; onTyping: (isTyping?: boolean) => void };

/** Enter sends, Shift+Enter adds a line. */
export function MessageComposer({ conversationId, disabledReason, onTyping }: Props) {
  const [content, setContent] = useState("");
  const send = useSendMessage(conversationId);

  if (disabledReason) {
    return <p className="border-t p-4 text-center text-sm text-muted-foreground">{disabledReason}</p>;
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!content.trim()) return;
    send.mutate({ conversationId, content });
    setContent("");
    onTyping(false);
  };

  return (
    <form className="flex items-end gap-2 border-t p-3" onSubmit={submit}>
      <Textarea
        className="max-h-32 min-h-10 resize-none"
        maxLength={MESSAGE_MAX_LENGTH}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping(e.target.value.length > 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
        }}
        placeholder="Écrire un message..."
        rows={1}
        value={content}
      />
      <Button aria-label="Envoyer" disabled={!content.trim()} size="icon" type="submit">
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  );
}
