import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEventAction } from "../actions/create-event.action";
import { EventInput } from "../schemas/event.schema";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventInput) => {
      const result = await createEventAction(data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["infosclub"] }); // Update upcoming events in dashboard if any
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
