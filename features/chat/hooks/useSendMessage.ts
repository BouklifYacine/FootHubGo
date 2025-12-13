import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "../services";
import type { SendMessageInput, Message } from "../types";
import { HTTPError } from "ky";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useSendMessage() {
  const queryClient = useQueryClient();
  const [isRateLimited, setIsRateLimited] = useState(false);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: SendMessageInput) => {
      try {
        return await MessageService.send(data);
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 429) {
          // Return a specific object for rate limit instead of throwing
          return { error: "rate_limit" as const };
        }
        throw error;
      }
    },
    onSuccess: (
      response: { message: Message } | { error: "rate_limit" },
      variables
    ) => {
      // Check if it was a rate limit "success"
      if ("error" in response && response.error === "rate_limit") {
        setIsRateLimited(true);
        return;
      }

      // Existing success logic
      if ("message" in response) {
        queryClient.invalidateQueries({
          queryKey: ["messages", variables.conversationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        });
      }
    },
    onError: (error: unknown) => {
      // Handle actual errors (network, 500s, etc.)
      console.error("Send message error:", error);
      toast.error("Erreur d'envoi", {
        description: "Impossible d'envoyer le message.",
      });
    },
  });

  return {
    ...mutation,
    isRateLimited,
    clearRateLimit,
  };
}
