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
    mutationFn: (data: SendMessageInput) => MessageService.send(data),
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error instanceof HTTPError && error.response.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
    onSuccess: (response: { message: Message }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: (error: unknown) => {
      // Check for rate limit error (HTTP 429)
      if (error instanceof HTTPError && error.response.status === 429) {
        setIsRateLimited(true);
        // We suppress the toast here because we show the banner
        return;
      }

      // Handle other errors
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
