import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateEventAction } from "../actions/update-event.action";
import { EventInput } from "../schemas/event.schema";

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventInput }) => {
      const result = await updateEventAction(id, data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
