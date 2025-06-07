// components/examples/chat-card-demo.tsx
import { ChatCard, Message } from "@/components/ui/chat-card";
import { useState } from "react";
import { useTheme } from "next-themes";

const CURRENT_USER = {
  name: "You",
  avatar: "https://cdn.vox-cdn.com/thumbor/r0U59Lx7DOSI2Z_F7WLnzcbQfuU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24953495/1698708349.jpg"
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content: "Hey team! I've just pushed the latest design changes 🎨",
    sender: {
      name: "Alex Chen",
      avatar: "https://cdn.vox-cdn.com/thumbor/r0U59Lx7DOSI2Z_F7WLnzcbQfuU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24953495/1698708349.jpg",
      isOnline: true,
    },
    timestamp: "10:24 AM",
    status: "read",
    reactions: [
      { emoji: "👍", count: 2, reacted: true },
      { emoji: "🎉", count: 1, reacted: false },
    ],
  },
  {
    id: "2",
    content: "Looking great! The new color scheme is perfect",
    sender: {
      name: "Sarah Kim",
      avatar: "https://cdn.vox-cdn.com/thumbor/r0U59Lx7DOSI2Z_F7WLnzcbQfuU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24953495/1698708349.jpg",
      isOnline: true,
    },
    timestamp: "10:26 AM",
    status: "delivered",
  },
  {
    id: "3",
    content: "Thanks! I'll prepare the documentation now.",
    sender: {
      name: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      isOnline: true,
      isCurrentUser: true
    },
    timestamp: "10:30 AM",
    status: "delivered",
  }
];

export function Chat() {
  const { resolvedTheme } = useTheme();
  const [chats] = useState([
    {
      id: 1,
      name: "Team Chat",
      membersCount: 3,
      onlineCount: 2,
      messages: INITIAL_MESSAGES,
    }
  ]);

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <ChatCard
          chatName={chats[0].name}
          membersCount={chats[0].membersCount}
          onlineCount={chats[0].onlineCount}
          initialMessages={chats[0].messages}
          currentUser={CURRENT_USER}
          theme={resolvedTheme as "light" | "dark"}
          className={resolvedTheme === "light" ? "border border-zinc-200" : ""}
          onSendMessage={(message) => console.log('Sent:', message)}
          onReaction={(messageId, emoji) => console.log('Reaction:', messageId, emoji)}
          onMoreClick={() => console.log('More clicked')}
        />
      </div>
    </div>
  );
}