import type { InfiniteData } from "@tanstack/react-query";
import type { MessagesPage } from "./server/queries";

export type { ConversationDto, MessageDto, ParticipantDto } from "@/lib/realtime/protocol";
export type { MessagesPage };

/** Cached messages of a conversation: `pages[0]` is the newest page. */
export type MessagesData = InfiniteData<MessagesPage, string | undefined>;
