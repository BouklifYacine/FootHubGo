const BASE_URL = "/api/chat";

export const ChatService = {
  // Get all conversations for the current user
  async getConversations() {
    const response = await fetch(`${BASE_URL}/conversations`);
    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }
    return response.json();
  },

  // Get messages for a specific conversation
  async getMessages(conversationId: string) {
    const response = await fetch(
      `${BASE_URL}/messages?conversationId=${conversationId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    return response.json();
  },

  // Create a new conversation
  async createConversation(data: {
    type: "PRIVATE" | "GROUP";
    participantIds: string[];
    name?: string;
  }) {
    const response = await fetch(`${BASE_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }
    return response.json();
  },

  // Send a message
  async sendMessage(data: { conversationId: string; content: string }) {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    return response.json();
  },

  // Get club members for new conversation modal
  async getClubMembers() {
    const response = await fetch(`${BASE_URL}/members`);
    if (!response.ok) {
      throw new Error("Failed to fetch club members");
    }
    return response.json();
  },

  // Mark messages as read
  async markAsRead(conversationId: string) {
    const response = await fetch(`${BASE_URL}/messages/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    if (!response.ok) {
      throw new Error("Failed to mark messages as read");
    }
    return response.json();
  },
};
