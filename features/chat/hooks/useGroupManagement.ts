import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Conversation, ConversationsResponse } from "../types/chat.types";
import { ChatService } from "../services/ChatService";

interface UpdateGroupInput {
  conversationId: string;
  name: string;
}

interface DeleteGroupInput {
  conversationId: string;
}

interface ManageMembersInput {
  conversationId: string;
  memberIds?: string[];
  targetUserId?: string;
  action: "add" | "kick" | "leave";
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGroupInput) =>
      ChatService.updateConversation(input.conversationId, input.name),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const previousConversations =
        queryClient.getQueryData<ConversationsResponse>(["conversations"]);

      queryClient.setQueryData<ConversationsResponse>(
        ["conversations"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.map((c) =>
              c.id === variables.conversationId
                ? { ...c, name: variables.name }
                : c
            ),
          };
        }
      );

      return { previousConversations };
    },
    onError: (_, __, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ["conversations"],
          context.previousConversations
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteGroupInput) =>
      ChatService.deleteConversation(input.conversationId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const previousConversations =
        queryClient.getQueryData<ConversationsResponse>(["conversations"]);

      queryClient.setQueryData<ConversationsResponse>(
        ["conversations"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.filter(
              (c) => c.id !== variables.conversationId
            ),
          };
        }
      );

      return { previousConversations };
    },
    onError: (_, __, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ["conversations"],
          context.previousConversations
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useManageMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManageMembersInput) => {
      if (input.action === "add" && input.memberIds) {
        return ChatService.addMembers(input.conversationId, input.memberIds);
      } else if (input.targetUserId) {
        return ChatService.removeMember(
          input.conversationId,
          input.targetUserId
        );
      }
      throw new Error("Invalid action");
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const previousConversations =
        queryClient.getQueryData<ConversationsResponse>(["conversations"]);

      if (variables.action === "kick" || variables.action === "leave") {
        queryClient.setQueryData<ConversationsResponse>(
          ["conversations"],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              conversations: old.conversations.map((c) =>
                c.id === variables.conversationId
                  ? {
                      ...c,
                      participants: c.participants.filter(
                        (p) => p.id !== variables.targetUserId
                      ),
                    }
                  : c
              ),
            };
          }
        );
      }

      return { previousConversations };
    },
    onError: (_, __, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ["conversations"],
          context.previousConversations
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
