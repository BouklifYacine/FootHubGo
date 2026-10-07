import { z } from "zod";

export const MESSAGE_MAX_LENGTH = 2000;
/** Including the creator. */
export const GROUP_MAX_MEMBERS = 30;

const id = z.string().min(1).max(64);
const userIds = z.array(id).min(1, "Sélectionnez au moins un membre").max(GROUP_MAX_MEMBERS - 1);
const groupName = z
  .string()
  .trim()
  .min(1, "Le nom du groupe est requis")
  .max(50, "Le nom du groupe est trop long");

export const sendMessageSchema = z.object({
  conversationId: id,
  content: z
    .string()
    .trim()
    .min(1, "Le message est vide")
    .max(MESSAGE_MAX_LENGTH, `Le message est trop long (${MESSAGE_MAX_LENGTH} caractères max)`),
});

export const deleteMessageSchema = z.object({ messageId: id, scope: z.enum(["me", "all"]) });

export const createConversationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("PRIVATE"), userId: id }),
  z.object({ type: z.literal("GROUP"), name: groupName, userIds }),
]);

export const renameGroupSchema = z.object({ conversationId: id, name: groupName });
export const addGroupMembersSchema = z.object({ conversationId: id, userIds });
/** Kick another member (admin) or leave (userId = yourself). */
export const removeGroupMemberSchema = z.object({ conversationId: id, userId: id });
export const pinConversationSchema = z.object({ conversationId: id, pinned: z.boolean() });
export const blockUserSchema = z.object({ userId: id, blocked: z.boolean() });
export const conversationIdSchema = id;

export type CreateConversationInput = z.input<typeof createConversationSchema>;
export type DeleteMessageScope = z.infer<typeof deleteMessageSchema>["scope"];
