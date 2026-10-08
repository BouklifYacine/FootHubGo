/**
 * All TanStack Query keys of the app, in one place.
 * Keys are hierarchical: invalidating `queryKeys.events.all` also refreshes
 * every list / detail / call-up query nested under it.
 */
export const queryKeys = {
  home: ["home"] as const,

  me: {
    all: ["me"] as const,
    profile: ["me", "profile"] as const,
    accounts: ["me", "accounts"] as const,
    team: ["me", "team"] as const,
    joinRequests: ["me", "join-requests"] as const,
    callUps: ["me", "call-ups"] as const,
    attendances: ["me", "attendances"] as const,
    /** Navigation badges (call-ups to answer, join requests to review). */
    badges: ["me", "badges"] as const,
    /** Onboarding tours already seen. */
    tours: ["me", "tours"] as const,
  },

  /** Club directory (clubs and their sections). */
  teams: {
    all: ["teams"] as const,
  },

  /** The caller's club: management page and the join requests they review. */
  club: {
    all: ["club"] as const,
    admin: ["club", "admin"] as const,
    joinRequests: ["club", "join-requests"] as const,
    /** Every member of the club (chat). */
    members: ["club", "members"] as const,
  },

  events: {
    all: ["events"] as const,
    list: (filters: Record<string, unknown>) => ["events", "list", filters] as const,
    calendar: ["events", "calendar"] as const,
    detail: (eventId: string) => ["events", "detail", eventId] as const,
    callUps: (eventId: string) => ["events", "detail", eventId, "call-ups"] as const,
  },

  stats: {
    all: ["stats"] as const,
    teams: ["stats", "teams"] as const,
    team: (teamId: string) => ["stats", "teams", teamId] as const,
    players: ["stats", "players"] as const,
  },

  injuries: {
    all: ["injuries"] as const,
    player: (userId: string) => ["injuries", "player", userId] as const,
    team: (teamId: string) => ["injuries", "team", teamId] as const,
  },

  chat: {
    all: ["chat"] as const,
    conversations: ["chat", "conversations"] as const,
    messages: (conversationId: string) => ["chat", "messages", conversationId] as const,
  },

  notifications: {
    all: ["notifications"] as const,
  },

  polls: {
    all: ["polls"] as const,
  },

  admin: {
    all: ["admin"] as const,
    users: (filters: Record<string, unknown>) => ["admin", "users", filters] as const,
    userCount: ["admin", "user-count"] as const,
    revenue: ["admin", "revenue"] as const,
    stats: ["admin", "stats"] as const,
  },
};
